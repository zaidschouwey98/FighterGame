import { Container } from "pixi.js";
import { Action } from "../../shared/Action";
import Player from "../../shared/Player";
import { EventBus } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { NetworkClient } from "./network/NetworkClient";
import PlayerRenderer from "./render/PlayerRenderer";
import { InputHandler } from "./core/InputHandler";
import type { AttackData } from "../../shared/AttackData";


export class GameController {
    private gameState: GameState;
    private renderer: PlayerRenderer;
    private network: NetworkClient;
    private eventBus: EventBus;
    private localPlayerId: string | null = null;
    private inputHandler:InputHandler;

    constructor(parentContainer: Container, serverUrl: string) {
        this.inputHandler = new InputHandler();
        this.eventBus = new EventBus();
        this.gameState = new GameState();
        this.renderer = new PlayerRenderer(parentContainer);
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

        this.eventBus.on("player:attackedResult", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });
        
    }
    

    public update(delta: number) {
        if (!this.localPlayerId) return;
        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;

        this.handleMovement(player, delta);
        if (this.inputHandler.consumeAttack()) {
            this.performAttack();
        }
        this.gameState.players.set(this.localPlayerId,player)
    }

    private performAttack() {
        if (!this.localPlayerId) return;
        
        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;

        const mousePos = this.inputHandler.getMousePosition();
        const dx = mousePos.x - player.position.x;
        const dy = mousePos.y - player.position.y;
        let dir = Math.atan2(dy, dx);
        player.currentAction = Action.ATTACK_1;
        this.network.attack({
            playerId: this.localPlayerId,
            position: {
                x: 0,
                y: 0
            },
            rotation: dir,
            hitbox: {
                x: 0,
                y: 0,
                angle: 0,
                range: 0,
                arcAngle: 0
            },
            playerAction: Action.ATTACK_1
        })

    }

    private handleMovement(player: Player, delta: number) {
        let dx = 0;
        let dy = 0;
        
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
            player.position.y += dy * player.speed * 16*  delta / 60;
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