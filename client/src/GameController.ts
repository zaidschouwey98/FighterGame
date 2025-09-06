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
import { BlockService } from "./core/BlockService";
import type { LocalPlayer } from "./core/LocalPlayer";
import type PlayerInfo from "../../shared/PlayerInfo";
import { Action } from "../../shared/Action";
import { CHUNK_SIZE, KNOCKBACK_TIMER, TILE_SIZE } from "./constantes";
import { TeleportService } from "./core/TeleportService";


export class GameController {
    private gameState = GameState.instance;
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private coordinateService: CoordinateService;
    private renderer: Renderer;
    private network: NetworkClient;
    private movementService: MovementService;
    private attackService: AttackService;
    private blockService: BlockService
    private localPlayerId: string | null = null;
    private currentChunkX?:number;
    private currentChunkY?:number;
    private teleportService: TeleportService;

    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {

        this.renderer = new Renderer(app, globalContainer, spriteSheets);

        this.coordinateService = new CoordinateService(app, this.renderer.camera);
        this.network = new NetworkClient(serverUrl, this.eventBus);
        this.movementService = new MovementService(this.inputHandler, this.network,this.renderer);
        this.attackService = new AttackService(this.inputHandler, this.coordinateService, this.network);
        this.blockService = new BlockService(this.inputHandler,this.coordinateService,this.network);
        this.teleportService = new TeleportService(this.inputHandler,this.coordinateService,this.network);
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.eventBus.on("connected", (playerId: string) => {
            this.localPlayerId = playerId;
        });

        this.eventBus.on("players:update", (info: { playerArray: PlayerInfo[], localPlayer: LocalPlayer }) => {
            this.gameState.restorePlayerState(info.playerArray, info.localPlayer);
            const playersArray = Array.from(this.gameState.players.values());
            this.renderer.playerRenderer.updatePlayers(playersArray);
        });

        this.eventBus.on("player:joined", (player: PlayerInfo) => {
            this.gameState.addPlayer(player);
            let joinedPlayer = this.gameState.players.get(player.id)
            this.renderer.playerRenderer.updatePlayers([joinedPlayer!]);
        });

        this.eventBus.on("player:left", (playerId: string) => {
            this.gameState.removePlayer(playerId);
            this.renderer.playerRenderer.removePlayer(playerId);
        });

        this.eventBus.on("player:died", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            if(player.id == this.localPlayerId){
                this.gameState.getLocalPlayer().isDead = true;
            }
            let dead = this.gameState.players.get(player.id!)
            if(!dead) return;
            this.handleDeath(dead);
            // todo let corps rot
        });

        this.eventBus.on("player:respawn", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            
        });

        this.eventBus.on("player:moved", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            let movingPlayer = this.gameState.players.get(player.id)
            if(movingPlayer?.id == this.localPlayerId){
                return;
            }
            this.renderer.playerRenderer.updatePlayers([movingPlayer!]);

        });

        this.eventBus.on("player:stopMoving", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            let p = this.gameState.players.get(player.id)
            this.renderer.playerRenderer.updatePlayers([p!]);
        });

        this.eventBus.on("player:actionUpdated", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            let p = this.gameState.players.get(player.id)
            this.renderer.playerRenderer.updatePlayers([p!]); // Todo remove "!"
        });

        this.eventBus.on("player:attacks", (attackData: AttackData) => {
            this.renderer.playerRenderer.showAttackEffect(attackData);
        });

        

        this.eventBus.on("player:dashed", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            let p = this.gameState.players.get(player.id)
            this.renderer.playerRenderer.playDashAttackAnimation(p!);
        })

        this.eventBus.on("player:isBlocking", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            // this.renderer.playerRenderer.updatePlayers([player]);
        })
        this.eventBus.on("player:blockingEnded", (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
            // this.renderer.playerRenderer.updatePlayers([player]);
        })

        this.eventBus.on("player:attackedResult", (attackResult: AttackResult) => {
            const hitPlayers = attackResult.hitPlayers;
            if(attackResult.blockedBy && attackResult.attackerId == this.localPlayerId){
                this.attackService.attackGotBlocked(GameState.instance.getLocalPlayer(), attackResult.blockedBy.id, attackResult.knockbackStrength)
            }
            for (const hit of hitPlayers) {
                
                hit.hitFlashTimer = 10; // frames de rouge // todo REMOVE 
                this.gameState.updatePlayer(hit); // TODO FIX THIS CAUSE CAN'T UPDATE LOCAL PLAYER HP
                if (hit.id === this.localPlayerId) {
                    this.handleAttackReceived(attackResult);
                }
            }
        });
    }


    public handleAttackReceived(attackResult: AttackResult) {
        // Hp already set by the server
        // todo IF BLOCKING APPLY KNOCKBACK TO ATTACKER
        const attacker = this.gameState.players.get(attackResult.attackerId);
        const player = this.gameState.players.get(this.localPlayerId!);
        if (!player) throw new Error("Player not in game received damage.");

        if (!attacker) return;
        let didBlock = false;
        if(player.isDead){
            // this.handleDeath(player);
            return;
        }
        // If player is blocking
        if (player.currentAction === Action.BLOCK_BOTTOM 
            || player.currentAction === Action.BLOCK_LEFT
            || player.currentAction === Action.BLOCK_RIGHT
            || player.currentAction === Action.BLOCK_TOP
        ) // todo check if in correction direction serverside
        {
            didBlock = true;
            this.blockService.playerSuccessfullyBlocked(player);
        }

        const dx = player.position.x - attacker.position.x;
        const dy = player.position.y - attacker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const knockbackStrength = !didBlock ? attackResult.knockbackStrength : attackResult.knockbackStrength/2;
        player.knockbackReceived = {
            x: (dx / len) * knockbackStrength,
            y: (dy / len) * knockbackStrength,
        };
        if(!didBlock) player.currentAction = player.knockbackReceived.x >= 0 ? Action.TOOK_HIT_FROM_LEFT : Action.TOOK_HIT_FROM_RIGHT;
        player.knockbackTimer = KNOCKBACK_TIMER; // Frames de knockback // TODO CHANGE THIS FROM ATTACK
    }

    private handleDeath(player: Player) {
        this.renderer.playerRenderer.renderDyingPlayer(player);
    }


    public update(delta: number) {

        if (!this.localPlayerId) return;
        const player = this.gameState.players.get(this.localPlayerId);

        if (!player) return;
        if (player.isDead) {
            // Pas d'inputs ni de mouvements
            return;
        }
        this.renderer.updateCamera(player.position)

        // Receive knockback
        if (player.knockbackTimer && player.knockbackTimer > 0 && player.knockbackReceived) {
            player.position.x += player.knockbackReceived.x * delta;
            player.position.y += player.knockbackReceived.y * delta;
            // Ralentissement progressif
            player.knockbackReceived.x *= 0.85;
            player.knockbackReceived.y *= 0.85;

            player.knockbackTimer-=delta;
            if (player.knockbackTimer <= 0) {
                player.knockbackReceived = undefined;
                player.knockbackTimer = undefined;
            }
            this.renderer.playerRenderer.updatePlayers([player]);
            this.network.move({ x: player.position.x, y: player.position.y }, player.currentAction);
            return;
        }

        // Handle attack dash if ongoing
        if (player.attackDashTimer && player.attackDashTimer > 0) {
            this.handleAttackDash(player, delta);
        } else if (!player.isBlocking) {
            this.movementService.handleMovement(player, delta);
        }

        // Handle block and canceling attack
        if (this.attackService.attackOngoing && this.inputHandler.consumeRightClick()) {
            this.attackService.stopAttack();
        } else if (this.inputHandler.consumeRightClick()) {
            this.blockService.startBlock(player);
        }

        // handle attack
        if (this.inputHandler.consumeAttack() && !player.isBlocking) {
            this.attackService.initiateAttack(player);
        }

        // render world
        const tileX = Math.floor(player.position.x / TILE_SIZE);
        const tileY = Math.floor(player.position.y / TILE_SIZE);
        const chunkX = Math.floor(tileX / CHUNK_SIZE);
        const chunkY = Math.floor(tileY / CHUNK_SIZE);
        if(chunkX != this.currentChunkX || chunkY != this.currentChunkY){
            this.currentChunkX = chunkX;
            this.currentChunkY = chunkY;
            this.renderer.worldRenderer.update(chunkX, chunkY);
        }

        // Minimap
        this.renderer.updateMinimap(this.localPlayerId);
        this.teleportService.update(player,delta);
        this.blockService.update(player,delta);
        this.attackService.update(delta, player);
    }

    private handleAttackDash(player: Player, delta:number) {
        if (!player.attackDashTimer || player.attackDashTimer <= 0) return;
    
        // Progression totale du dash (0 → 1)
        const t = 1 - player.attackDashTimer / player.attackDashDuration!;

        // Fonction mathématique     avec freeze
        const freezeRatio = 10 / player.attackDashDuration!; // 15 premières frames sans mouvement
        const p = 9; // contrôle la douceur
        let speedFactor = 0;

        if (t >= freezeRatio) {
            const tPrime = (t - freezeRatio) / (1 - freezeRatio);
            speedFactor = Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
        }

        const speed = player.attackDashMaxSpeed * speedFactor;

        // Déplacement
        player.position.x += player.dashDir.x * speed;
        player.position.y += player.dashDir.y * speed;

        player.attackDashTimer -= delta;
        player.currentAction = DashHelper.getDashAttackActionByVector(player.dashDir);
        this.renderer.playerRenderer.playDashAttackAnimation(player);
        this.network.move({ ...player.position }, player.currentAction);

        if (player.attackDashTimer <= 0 && player.pendingAttack) {
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
