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
import DashDirection from "./helper/DashDirection";


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

        this.eventBus.on("player:dashed", (player:Player)=>{
            this.renderer.overridePlayerAnimation(player);
        })

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

    
        this.attackService.update(delta,player);
        this.gameState.updatePlayer(player);
    }

    private handleDash(player: Player) {
        if (!player.dashTimer || !player.dashVelocity) return;

        const totalFrames = 14;
        const t = 1 - player.dashTimer / totalFrames; // progression 0 -> 1
        const ease = Math.sin((Math.PI / 2) * t);  // easing sinusoïdal (ease-in-out)

        // position de départ + distance totale * easing
        player.position.x = player.dashPositionStart!.x + player.dashVelocity.x * ease;
        player.position.y = player.dashPositionStart!.y + player.dashVelocity.y * ease;

        player.dashTimer!--;
        player.currentAction = DashDirection.getDashActionByVelocity(player.dashVelocity);

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
