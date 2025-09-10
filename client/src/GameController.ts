import { Application, Container, Spritesheet } from "pixi.js";
import Player from "./core/player/Player";
import type { AttackResult } from "../../shared/AttackResult";
import { AttackService } from "./core/AttackService";
import { CoordinateService } from "./core/CoordinateService";
import { EventBus, EventBusMessage } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { InputHandler } from "./core/InputHandler";
import { MovementService } from "./core/MovementService";
import { NetworkClient } from "./network/NetworkClient";
import { Renderer } from "./render/Renderer";
import { BlockService } from "./core/BlockService";
import type PlayerInfo from "../../shared/PlayerInfo";
import { CHUNK_SIZE, KNOCKBACK_TIMER, TILE_SIZE } from "./constantes";
import { TeleportService } from "./core/TeleportService";
import { PhysicsService } from "./core/PhysicsService";


export class GameController {
    private gameState: GameState;
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private renderer: Renderer;
    private localPlayerId: string | null = null;
    private currentChunkX?: number;
    private currentChunkY?: number;
    private localPlayer: Player | undefined;
    private networkClient: NetworkClient;

    // Services
    private coordinateService: CoordinateService;
    private attackService: AttackService;
    private blockService: BlockService
    private teleportService: TeleportService;
    private movementService: MovementService;

    private onDeath?: () => void;
    private onRespawn?: () => void;
    constructor(
        globalContainer: Container,
        serverUrl: string,
        app: Application,
        spriteSheets: Spritesheet[],
        opts?: {
            onDeath?: () => void;
            onRespawn?: () => void;
        }
    ) {
        this.onDeath = opts?.onDeath;
        this.onRespawn = opts?.onRespawn;

        this.setupEventListeners();
        this.networkClient = new NetworkClient(serverUrl, this.eventBus);
        this.gameState = GameState.instance;
        this.renderer = new Renderer(app, globalContainer, spriteSheets, this.eventBus);
        this.coordinateService = new CoordinateService(app, this.renderer.camera);

        this.movementService = new MovementService(this.inputHandler);
        this.attackService = new AttackService(this.inputHandler, this.coordinateService);
        this.blockService = new BlockService(this.inputHandler, this.coordinateService);
        this.teleportService = new TeleportService(this.inputHandler, this.coordinateService);
        this.renderer.worldRenderer.update(0, 0);
    }

    private setupEventListeners() {
        // Connexion
        this.eventBus.on(EventBusMessage.CONNECTED, (playerId: string) => {
            console.log("playerId : " + playerId)
            this.localPlayerId = playerId;
        });

        // Snapshot complet au spawn
        this.eventBus.on(EventBusMessage.PLAYERS_INIT, (players: PlayerInfo[]) => {
            this.gameState.restorePlayers(players);
        });

        // MAJ unique pour tout changement de joueur
        this.eventBus.on(EventBusMessage.PLAYER_UPDATED, (player: PlayerInfo) => {
            if (player.id !== this.localPlayerId)
                this.gameState.updatePlayer(player);
        });

        // Nouveau joueur
        this.eventBus.on(EventBusMessage.PLAYER_JOINED, (player: PlayerInfo) => {
            if (player.id === this.localPlayerId) {
                this.localPlayer = new Player(
                    player.name,
                    player.position,
                    player.hp,
                    player.speed,
                    this.localPlayerId!,
                    this.eventBus,
                    this.inputHandler,
                    this.attackService,
                    this.movementService,
                    this.blockService,
                    this.teleportService
                );
                this.localPlayer.updateFromInfo(player);
                return;
            }
            this.gameState.addPlayer(player);
        });

        // Joueur parti
        this.eventBus.on(EventBusMessage.PLAYER_LEFT, (playerId: string) => {
            this.gameState.removePlayer(playerId);
        });

        // Résultat attaque
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult: AttackResult) => {
            this.handleAttackResult(attackResult);
        });

        this.eventBus.on(EventBusMessage.PLAYER_DIED, (player) => {
            if (player.id === this.localPlayer?.id) {
                this.localPlayer!.die();
                this.onDeath?.()
            }
            this.gameState.updatePlayer(player);
        });

        this.eventBus.on(EventBusMessage.PLAYER_RESPAWNED, (player) => {
            this.gameState.updatePlayer(player);
            if (player.id === this.localPlayer?.id) {
                this.onRespawn?.();
                this.eventBus.emit(EventBusMessage.PLAYER_JOINED,player)
            }
        });
    }

    public spawnLocalPlayer(name: string) {
        this.networkClient.spawnPlayer(name);
    }

    public requestRespawn() {
        this.networkClient.respawnPlayer();
    }

    private handleAttackResult(attackResult: AttackResult) {
        const hitPlayers = attackResult.hitPlayers;
        const attacker = GameState.instance.getPlayer(attackResult.attackerId)!;
        if (attackResult.attackerId === this.localPlayerId) {
            if (attackResult.blockedBy != undefined) {
                this.localPlayer!.knockbackReceivedVector = PhysicsService.computeKnockback(GameState.instance.getPlayer(attackResult.blockedBy.id)!.position, this.localPlayer!.position, attackResult.knockbackStrength)
                this.localPlayer!.knockbackTimer = KNOCKBACK_TIMER;
                console.log(this.localPlayer)
                this.localPlayer?.changeState(this.localPlayer.knockbackState);
            }
        }

        for (const hit of hitPlayers) {
            this.gameState.updatePlayer(hit);
            if (hit.id === this.localPlayerId) {
                if (attackResult.blockedBy?.id === this.localPlayerId)
                    continue;

                this.localPlayer!.knockbackReceivedVector = PhysicsService.computeKnockback(attacker.position, this.localPlayer!.position, attackResult.knockbackStrength)
                this.localPlayer!.knockbackTimer = KNOCKBACK_TIMER;
                this.localPlayer?.takeDamage(hit.hp);
            }
        }
    }


    public update(delta: number) {

        if (!this.localPlayer) return;


        // Handle attack dash if ongoing
        this.localPlayer.update(delta);

        // render world
        const tileX = Math.floor(this.localPlayer.position.x / TILE_SIZE);
        const tileY = Math.floor(this.localPlayer.position.y / TILE_SIZE);
        const chunkX = Math.floor(tileX / CHUNK_SIZE);
        const chunkY = Math.floor(tileY / CHUNK_SIZE);
        if (chunkX != this.currentChunkX || chunkY != this.currentChunkY) {
            this.currentChunkX = chunkX;
            this.currentChunkY = chunkY;
            this.renderer.worldRenderer.update(chunkX, chunkY);
        }

        this.renderer.updateCamera(this.localPlayer.position)
        this.inputHandler.update();
        this.renderer.updateMinimap(this.localPlayer);
        this.teleportService.update(delta);
        this.blockService.update(delta);
        this.attackService.update(delta, this.localPlayer);
    }
}
