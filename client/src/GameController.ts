import { Application, Container, Spritesheet } from "pixi.js";
import { Player } from "../../shared/player/Player";
import type { AttackResult } from "../../shared/AttackResult";
import { CoordinateService } from "./core/CoordinateService";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { GameState } from "./core/GameState";
import { InputHandler } from "./core/InputHandler";
import { MovementService } from "../../shared/services/MovementService";
import { NetworkClient } from "./network/NetworkClient";
import { Renderer } from "./render/Renderer";
import type PlayerInfo from "../../shared/PlayerInfo";
import { CHUNK_SIZE, TILE_SIZE } from "../../shared/constantes";

export class GameController {
    private gameState: GameState;
    private eventBus = new EventBus();
    private inputHandler;
    private renderer: Renderer;
    private localPlayerId: string | null = null;
    private currentChunkX?: number;
    private currentChunkY?: number;
    private localPlayer: Player | undefined;
    private networkClient: NetworkClient;

    // Services
    private coordinateService: CoordinateService;

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
        this.inputHandler = new InputHandler(this.coordinateService);
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
            this.localPlayer?.handleAttackReceived(attackResult, (id) => this.gameState.players.get(id)!.position);
        });

        this.eventBus.on(EventBusMessage.PLAYER_DIED, (player) => {
            if (player.id === this.localPlayer?.id) {
                this.localPlayer!.die();
                this.onDeath?.()
            } else 
            this.gameState.removePlayer(player.id);
        });

        this.eventBus.on(EventBusMessage.PLAYER_RESPAWNED, (player) => {
            if (player.id === this.localPlayer?.id) {
                this.onRespawn?.();
            } 
            this.eventBus.emit(EventBusMessage.PLAYER_JOINED,player)
        });
    }

    public spawnLocalPlayer(name: string) {
        this.networkClient.spawnPlayer(name);
    }

    public requestRespawn() {
        this.networkClient.respawnPlayer();
    }

    public update(delta: number) {
        for(const value of GameState.instance.players.values()){
            if(!value.isDead && value.movingVector.dx != 0 || value.movingVector.dy != 0)
            {
                MovementService.movePlayer(value,value.movingVector!.dx, value.movingVector!.dy, delta, value.speed);
                this.renderer.playersRenderer.syncPlayers([value]);
            }
        }
        this.renderer.update(delta);



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
        this.renderer.updateMinimap(this.localPlayer);
        
    }
}
