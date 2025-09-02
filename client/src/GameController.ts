import { Application, Container, Spritesheet } from "pixi.js";
import { Action } from "../../shared/Action";
import type { AttackResult } from "../../shared/AttackResult";
import Player from "../../shared/Player";
import { EventBus } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { NetworkClient } from "./network/NetworkClient";
import PlayerRenderer from "./render/PlayerRenderer";
import { InputHandler } from "./core/InputHandler";
import type { AttackData } from "../../shared/AttackData";
import { CoordinateService } from "./core/CoordinateService";
import { AttackHitboxService } from "./core/AttackHitboxService";


export class GameController {
    private gameState: GameState;
    private renderer: PlayerRenderer;
    private network: NetworkClient;
    private eventBus: EventBus;
    private localPlayerId: string | null = null;
    private inputHandler: InputHandler;
    private coordinateService: CoordinateService;


    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {
        this.coordinateService = new CoordinateService(app);
        this.inputHandler = new InputHandler();
        this.eventBus = new EventBus();
        this.gameState = new GameState();
        this.renderer = new PlayerRenderer(globalContainer, spriteSheets);
        this.network = new NetworkClient(serverUrl, this.eventBus);
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Quand on se connecte au serveur
        this.eventBus.on("connected", (playerId: string) => {
            console.log("Connecté avec ID:", playerId);
            this.localPlayerId = playerId;
        });

        // Quand le serveur envoie la liste des joueurs
        this.eventBus.on("players:update", (players: Player[]) => {
            this.gameState.updatePlayers(players);
            this.renderer.updatePlayers(players);
        });

        // Quand un joueur rejoint
        this.eventBus.on("player:joined", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });

        // Quand un joueur quitte
        this.eventBus.on("player:left", (playerId: string) => {
            this.gameState.removePlayer(playerId);
            this.renderer.removePlayer(playerId);
        });

        // quand un joueur bouge
        this.eventBus.on("player:moved", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });

        this.eventBus.on("player:attacks", (attackData: AttackData) => {
            this.renderer.showAttackEffect(attackData)

        });

        this.eventBus.on("player:attackedResult", (attackResult: AttackResult) => {
            for (const player of attackResult.hitPlayers) {
                this.gameState.updatePlayer(player);
                if (player.id == this.localPlayerId) {
                    // todo Handle damage taken
                    console.log("I GOT HIT")
                }
            }
            this.renderer.updatePlayers(attackResult.hitPlayers);
        });

    }


    public update(delta: number) {
        if (!this.localPlayerId) return;
        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;

        this.handleMovement(player, delta);
        if (this.inputHandler.consumeAttack()) {
            this.initiateAttack();
        }
        this.gameState.players.set(this.localPlayerId, player)
    }

    private initiateAttack() {
        if (!this.localPlayerId) return;

        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;

        const mousePos = this.inputHandler.getMousePosition();
        const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
        const dx = worldMousePos.x - player.position.x;
        const dy = worldMousePos.y - player.position.y;
        let dir = Math.atan2(dy, dx);

        // DASH config
        const dashDistance = 80; // pixels totaux
        const dashFrames = 14;   // durée du dash
        player.dashVelocity = {
            x: Math.cos(dir) * dashDistance / dashFrames,
            y: Math.sin(dir) * dashDistance / dashFrames
        };
        player.dashTimer = dashFrames;

        // 👉 on garde la direction de l’attaque pour plus tard
        (player as any).pendingAttackDir = dir;
        (player as any).pendingAttack = true;

        this.gameState.updatePlayer(player);
    }

    private performAttack(player: Player, dir: number) {
        player.currentAction = Action.ATTACK_1;

        const hitbox = AttackHitboxService.createHitbox(player.position, dir);

        this.network.attack({
            playerId: player.id,
            position: { x: player.position.x, y: player.position.y },
            rotation: dir,
            hitbox,
            playerAction: Action.ATTACK_1
        });
    }

    private handleMovement(player: Player, delta: number) {
        let dx = 0;
        let dy = 0;
        if (player.dashTimer && player.dashTimer > 0 && player.dashVelocity) {
            const totalFrames = 14;
            const t = 1 - player.dashTimer / totalFrames;

            const speedFactor = Math.sin(Math.PI * t);
            player.position.x += (player.dashVelocity.x / 0.5) * speedFactor;
            player.position.y += (player.dashVelocity.y / 0.5) * speedFactor;

            player.dashTimer -= 1;
            player.currentAction = Action.ATTACK_DASH;

            this.network.move({
                x: player.position.x,
                y: player.position.y,
            }, player.currentAction);

            // 👉 si le dash est fini → lancer l’attaque
            if (player.dashTimer <= 0 && (player as any).pendingAttack) {
                this.performAttack(player, (player as any).pendingAttackDir);
                (player as any).pendingAttack = false;
            }

            return;
        }

        if (this.inputHandler.getKeys().has("w")) dy -= 1;
        if (this.inputHandler.getKeys().has("s")) dy += 1;
        if (this.inputHandler.getKeys().has("a")) dx -= 1;
        if (this.inputHandler.getKeys().has("d")) dx += 1;

        let newAction = player.currentAction;

        // Si déplacement
        if (dx !== 0 || dy !== 0) {
            // Normalisation (évite vitesse diagonale trop rapide)
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            // Mise à jour de la position
            player.position.x += dx * player.speed * 16 * delta / 60;
            player.position.y += dy * player.speed * 16 * delta / 60;
            // Choisir l'action en fonction de la direction
            if (dx > 0) newAction = Action.MOVE_RIGHT;
            else if (dx < 0) newAction = Action.MOVE_LEFT;
            else if (dy > 0) newAction = Action.MOVE_DOWN;
            else if (dy < 0) newAction = Action.MOVE_TOP;
            player.currentAction = newAction;

            // Envoyer la nouvelle position au serveur
            this.network.move({
                x: player.position.x,
                y: player.position.y,
            }, player.currentAction);

        } else {
            switch (player.currentAction) {
                case Action.MOVE_RIGHT:
                case Action.IDLE_RIGHT:
                    newAction = Action.IDLE_RIGHT;
                    break;
                case Action.MOVE_LEFT:
                case Action.IDLE_LEFT:
                    newAction = Action.IDLE_LEFT;
                    break;
                case Action.MOVE_TOP:
                case Action.IDLE_TOP:
                    newAction = Action.IDLE_TOP;
                    break;
                default:
                    newAction = Action.IDLE_DOWN;
            }

            player.currentAction = newAction;
            this.network.move({
                x: player.position.x,
                y: player.position.y,
            }, player.currentAction);
        }

    }

    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    public getLocalPlayerId(): string | null {
        return this.localPlayerId;
    }
}