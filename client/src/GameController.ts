import { Application, Container, Spritesheet } from "pixi.js";
import Player from "../../shared/Player";
import type { AttackData } from "../../shared/AttackData";
import type { AttackResult } from "../../shared/AttackResult";
import { AttackService } from "./core/AttackService";
import { CoordinateService } from "./core/CoordinateService";
import { EventBus } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { InputHandler } from "./core/InputHandler";
import { MovementService } from "./core/MovementService";
import { NetworkClient } from "./network/NetworkClient";
import DashHelper from "./helper/DashHelper";
import { Renderer } from "./render/Renderer";


export class GameController {
    private gameState = new GameState();
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private coordinateService: CoordinateService;
    private renderer: Renderer;
    private network: NetworkClient;
    private movementService: MovementService;
    private attackService: AttackService;
    private localPlayerId: string | null = null;

    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {

        this.renderer = new Renderer(app, globalContainer, spriteSheets);

        this.coordinateService = new CoordinateService(app, this.renderer.camera);
        this.network = new NetworkClient(serverUrl, this.eventBus);
        this.movementService = new MovementService(this.inputHandler, this.network);
        this.attackService = new AttackService(this.inputHandler, this.coordinateService, this.network);

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.eventBus.on("connected", (playerId: string) => {
            this.localPlayerId = playerId;
        });

        this.eventBus.on("players:update", (players: Player[]) => {
            this.gameState.updatePlayers(players);
            this.renderer.playerRenderer.updatePlayers(players);
        });

        this.eventBus.on("player:joined", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.playerRenderer.updatePlayers([player]);
        });

        this.eventBus.on("player:left", (playerId: string) => {
            this.gameState.removePlayer(playerId);
            this.renderer.playerRenderer.removePlayer(playerId);
        });

        this.eventBus.on("player:moved", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.playerRenderer.updatePlayers([player]);
        });

        this.eventBus.on("player:attacks", (attackData: AttackData) => {
            this.renderer.playerRenderer.showAttackEffect(attackData);
        });

        this.eventBus.on("player:dashed", (player: Player) => {
            this.renderer.playerRenderer.overridePlayerAnimation(player);
        })

        this.eventBus.on("player:attackedResult", (attackResult: AttackResult) => {
            for (const player of attackResult.hitPlayers) {
                this.gameState.updatePlayer(player);
                if (player.id == this.localPlayerId) {
                    // todo Handle damage taken
                    console.log("I GOT HIT")
                }
            }
            this.renderer.playerRenderer.updatePlayers(attackResult.hitPlayers);
        });
    }

    public update(delta: number) {
        if (!this.localPlayerId) return;
        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;
        this.renderer.updateCamera(player.position)
        if (player.dashTimer && player.dashTimer > 0) {
            this.handleDash(player);
        } else {
            this.movementService.handleMovement(player, delta);
        }
        if (this.inputHandler.consumeAttack()) {
            this.renderer.worldRenderer.update(player.position);
            this.attackService.initiateAttack(player);
        }


        this.attackService.update(delta, player);
        this.gameState.updatePlayer(player);
    }

    private handleDash(player: Player) {
        if (!player.dashTimer || player.dashTimer <= 0) return;

        // Progression totale du dash (0 → 1)
        const t = 1 - player.dashTimer / player.dashDuration;

        // Fonction mathématique avec freeze
        const freezeRatio = 15 / player.dashDuration; // 15 premières frames sans mouvement
        const p = 3; // contrôle la douceur
        let speedFactor = 0;

        if (t >= freezeRatio) {
            const tPrime = (t - freezeRatio) / (1 - freezeRatio);
            speedFactor = Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
        }

        const speed = player.dashMaxSpeed * speedFactor;

        // Déplacement
        player.position.x += player.dashDir.x * speed;
        player.position.y += player.dashDir.y * speed;

        player.dashTimer--;
        player.currentAction = DashHelper.getDashActionByVector(player.dashDir);

        this.network.move({ ...player.position }, player.currentAction);

        if (player.dashTimer <= 0 && player.pendingAttack) {
            this.attackService.performAttack(player, player.pendingAttackDir!);
            player.pendingAttack = false;
        }
    }



    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    public getLocalPlayerId(): string | null {
        return this.localPlayerId;
    }
}
