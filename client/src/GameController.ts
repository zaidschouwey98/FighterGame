import { Application, Container, Spritesheet } from "pixi.js";
import type { AttackReceivedData, KnockbackData } from "../../shared/types/AttackResult";
import { CoordinateService } from "./core/CoordinateService";
import { GameState } from "./core/GameState";
import { InputHandler } from "./core/InputHandler";
import { MovementService } from "../../shared/services/MovementService";
import { NetworkClient } from "./network/NetworkClient";
import { Renderer } from "./render/Renderer";
import type PlayerInfo from "../../shared/messages/PlayerInfo";
import { CHUNK_SIZE, TILE_SIZE } from "../../shared/constantes";
import { ClientPlayer } from "../../shared/entities/ClientPlayer";
import type { EntityInfo } from "../../shared/messages/EntityInfo";
import { EntityEvent, EventBus, LocalPlayerEvent, NetworkEvent } from "../../shared/services/EventBus";

export class GameController {
    private gameState: GameState;
    private eventBus = new EventBus();
    private localPlayerEventBus = new EventBus();
    private inputHandler;
    private renderer: Renderer;
    private localPlayerId: string | null = null;
    private currentChunkX?: number;
    private currentChunkY?: number;
    private localPlayer: ClientPlayer | undefined;
    private networkClient: NetworkClient;
    private playerName?: string;

    // Services
    private coordinateService: CoordinateService;

    private onDeath: () => void;
    private onRespawn: () => void;
    constructor(
        globalContainer: Container,
        serverUrl: string,
        app: Application,
        spriteSheets: Spritesheet[],
        opts: {
            onDeath: () => void;
            onRespawn: () => void;
        }
    ) {
        this.onDeath = opts.onDeath;
        this.onRespawn = opts.onRespawn;

        this.setupEventListeners();
        this.networkClient = new NetworkClient(serverUrl, this.eventBus, this.localPlayerEventBus);
        this.gameState = GameState.instance;
        this.renderer = new Renderer(app, globalContainer, spriteSheets, this.eventBus, "seed", (entityId: string) => {
            if (entityId === this.localPlayerId) {
                this.onDeath();
            }
        });
        this.coordinateService = new CoordinateService(app, this.renderer.camera);
        this.inputHandler = new InputHandler(this.coordinateService);
        this.renderer.worldRenderer.update(0, 0);

    }

    private setupEventListeners() {
        // Connexion
        this.eventBus.on(NetworkEvent.CONNECTED, (playerId: string) => {
            console.log("playerId : " + playerId)
            this.localPlayerId = playerId;
        });

        // Snapshot complet au spawn
        this.eventBus.on(NetworkEvent.ENTITIES_INIT, (players: EntityInfo[]) => {
            console.log("Init players", players);
            this.gameState.restoreEntities(players);
        });

        // MAJ unique pour tout changement de joueur
        this.eventBus.on(EntityEvent.UPDATED, (player: EntityInfo) => {
            if (player.id !== this.localPlayerId)
                this.gameState.updateEntity(player);
        });

        // Nouveau joueur
        this.eventBus.on(EntityEvent.ADDED, (player: EntityInfo) => {
            console.log("New player", player);
            if (player.id === this.localPlayerId) {
                this.localPlayer = new ClientPlayer(
                    this.localPlayerId!,
                    (player as PlayerInfo).name,
                    player.position,
                    player.hp,
                    player.speed,
                    this.localPlayerEventBus,
                    this.inputHandler,
                );
                this.localPlayer.updateFromInfo(player as PlayerInfo);
                return;
            }
            this.gameState.addEntity(player);
        });

        // Joueur parti
        this.eventBus.on(LocalPlayerEvent.LEFT, (playerId: string) => { // Todo change cause not really Local player
            this.gameState.removeEntity(playerId);
        });

        // Résultat attaque
        this.eventBus.on(EntityEvent.RECEIVE_ATTACK, (res: { entityId:string, attackReceivedData: AttackReceivedData}) => {
            if(res.entityId !== this.localPlayer?.id) throw new Error("Received attack for another entity");
            this.localPlayer?.handleAttackReceived(res.attackReceivedData);
        });

        this.eventBus.on(EntityEvent.KNOCKBACKED, (res: { entityId:string, knockbackData: KnockbackData}) => {
            if(res.entityId !== this.localPlayer?.id) throw new Error("Received knockback for another entity");
            this.localPlayer?.handleKnockbackReceived(res.knockbackData);
        });

        this.eventBus.on(EntityEvent.DIED, (res) => {
            if (res.entityInfo.id === this.localPlayer?.id) { // todo change
                this.localPlayer!.die();
            } else
                this.gameState.removeEntity(res.entityInfo.id);
        });

        this.eventBus.on(EntityEvent.SYNC, (entity: EntityInfo) => {
            if (entity.id === this.localPlayer?.id) {
                this.localPlayer?.updateFromInfo(entity as PlayerInfo);
            } else
                this.gameState.updateEntity(entity);
        });

        // this.eventBus.on(EventBusMessage.PLAYER_RESPAWNED, (player) => {
        //     // A ENLEVER NE SERT PLUS
        //     if (player.id === this.localPlayer?.id) {

        //     }
        //     this.eventBus.emit(EventBusMessage.ENTITY_ADDED, player);
        // });
    }

    public spawnLocalPlayer(name: string) {
        this.playerName = name;
        this.networkClient.spawnPlayer(name);
    }

    public requestRespawn() {
        this.onRespawn?.();
        this.networkClient.spawnPlayer(this.playerName!);
    }

    public update(delta: number) {
        for (const value of GameState.instance.entities.values()) {
            if (!value.isDead && value.movingVector.dx != 0 || value.movingVector.dy != 0) {
                MovementService.moveEntity(value, delta);
                this.renderer.playersRenderer.syncEntities([value]);
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
