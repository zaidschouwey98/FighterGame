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
import PlayerRenderer from "./render/PlayerRenderer";
import { Action } from "../../shared/Action";


export class GameController {
    private gameState = new GameState();
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private coordinateService: CoordinateService;
    private renderer: PlayerRenderer;
    private network: NetworkClient;
    private movementService: MovementService;
    private attackService: AttackService;
    private localPlayerId: string | null = null;

    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {
        this.coordinateService = new CoordinateService(app);
        this.renderer = new PlayerRenderer(globalContainer, spriteSheets);
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
            this.renderer.updatePlayers(players);
        });

        this.eventBus.on("player:joined", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });

        this.eventBus.on("player:left", (playerId: string) => {
            this.gameState.removePlayer(playerId);
            this.renderer.removePlayer(playerId);
        });

        this.eventBus.on("player:moved", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });

        this.eventBus.on("player:attacks", (attackData: AttackData) => {
            this.renderer.showAttackEffect(attackData);
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

        if (player.dashTimer && player.dashTimer > 0 && player.dashVelocity) {
            this.handleDash(player);
        } else {
            this.movementService.handleMovement(player, delta);
        }
        if (this.inputHandler.consumeAttack()) {
            this.attackService.initiateAttack(player);
        }

        if (player.attackIndex != 0)
            this.attackService.attackTimer -= delta;

        if (this.attackService.attackTimer <= 0 || player.attackIndex == 0) {
            player.attackIndex = 0;
            this.attackService.attackTimer = 30;
        }

        this.gameState.updatePlayer(player);
    }

    private handleDash(player: Player) {
        if (!player.dashTimer)
            return;

        const totalFrames = 14;
        const t = 1 - player.dashTimer / totalFrames;
        const speedFactor = Math.sin(Math.PI * t);

        player.position.x += (player.dashVelocity!.x / 0.5) * speedFactor;
        player.position.y += (player.dashVelocity!.y / 0.5) * speedFactor;

        player.dashTimer!--;
        player.currentAction = this.getDashAction(player.dashVelocity!);

        this.network.move({ ...player.position }, player.currentAction);

        if (player.dashTimer <= 0 && (player as any).pendingAttack) {
            this.attackService.performAttack(player, (player as any).pendingAttackDir);
            (player as any).pendingAttack = false;
        }
    }

    private getDashAction(velocity: { x: number, y: number }): Action {
        const angle = Math.atan2(velocity.y, velocity.x); 
        const deg = (angle * 180) / Math.PI;

        if (deg >= -22.5 && deg < 22.5) return Action.ATTACK_DASH_RIGHT;
        if (deg >= 22.5 && deg < 67.5) return Action.ATTACK_DASH_BOTTOM_RIGHT;
        if (deg >= 67.5 && deg < 112.5) return Action.ATTACK_DASH_BOTTOM;
        if (deg >= 112.5 && deg < 157.5) return Action.ATTACK_DASH_BOTTOM_LEFT;
        if (deg >= 157.5 || deg < -157.5) return Action.ATTACK_DASH_LEFT;
        if (deg >= -157.5 && deg < -112.5) return Action.ATTACK_DASH_TOP_LEFT;
        if (deg >= -112.5 && deg < -67.5) return Action.ATTACK_DASH_TOP;
        if (deg >= -67.5 && deg < -22.5) return Action.ATTACK_DASH_TOP_RIGHT;

        return Action.ATTACK_DASH_RIGHT; // fallback
    }

    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    public getLocalPlayerId(): string | null {
        return this.localPlayerId;
    }
}
