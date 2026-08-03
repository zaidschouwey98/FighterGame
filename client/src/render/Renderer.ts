import { Application, Container, Spritesheet } from "pixi.js";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";
import { Minimap } from "./UI/Minimap";
import { GameState } from "../core/GameState";
import type { Player } from "../../../shared/entities/Player";
import { ScoreBoard } from "./UI/ScoreBoard";
import EntityRenderer from "./EntityRenderer";
import type { AttackResult } from "../../../shared/types/AttackResult";
import { EffectRenderer } from "./EffectRenderer";
import type { EntityInfo } from "../../../shared/messages/EntityInfo";
import { EntityCommand, EntityEvent, EventBus, LocalPlayerEvent, NetworkEvent } from "../../../shared/services/EventBus";
import { EntityType } from "../../../shared/enums/EntityType";
import type PlayerInfo from "../../../shared/messages/PlayerInfo";
import { WorldAtmosphere } from "./WorldAtmosphere";

export class Renderer {
    private _eventBus: EventBus;

    private _pixiApp: Application;

    private _minimap: Minimap;

    private _globalContainer: Container;
    private _worldRoot: Container;
    private _tilesContainer: Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private _overlayContainer: Container;
    private _uiContainer: Container;

    private _entityRenderer: EntityRenderer;
    private _worldRenderer: WorldRenderer;
    private _worldAtmosphere: WorldAtmosphere;
    private _effectRenderer: EffectRenderer;

    private _camera: CameraService;
    private _scoreBoard: ScoreBoard;

    constructor(app: Application, rootContainer: Container, spriteSheets: Spritesheet[], eventBus: EventBus, seed: string = "seed", private onDeathAnimationFinished: (entityId: string) => void) {
        this._eventBus = eventBus;
        this._camera = new CameraService();

        this._pixiApp = app;
        const globalContainer = new Container();
        this._globalContainer = globalContainer;

        // monde groupé pour shaders d'ambiance (UI hors filtre)
        this._worldRoot = new Container({ label: "world_root" });
        this._tilesContainer = new Container({ label: "tiles_container" });
        this._terrainContainer = new Container({ label: "terrain_container" });
        this._objectContainer = new Container({ label: "object_container" });
        this._overlayContainer = new Container({ label: "overlay_container" });
        this._uiContainer = new Container({ label: "ui_container" });

        this._uiContainer.x = app.canvas.width - 400;
        this._uiContainer.y = 20;

        globalContainer.scale.set(this._camera.zoom);

        // Depth layer : props (arbres/herbe) + entités — tri Y partagé
        this._terrainContainer.sortableChildren = true;
        this._terrainContainer.label = "depth_container";

        this._worldRoot.addChild(this._tilesContainer);
        this._worldRoot.addChild(this._terrainContainer);
        this._worldRoot.addChild(this._objectContainer);
        this._worldRoot.addChild(this._overlayContainer);
        globalContainer.addChild(this._worldRoot);
        rootContainer.addChild(globalContainer);
        rootContainer.addChild(this._uiContainer);

        this._worldAtmosphere = new WorldAtmosphere(this._worldRoot);
        this._scoreBoard = new ScoreBoard(this._uiContainer, 214);
        this._minimap = new Minimap(this._uiContainer, 188);
        this._entityRenderer = new EntityRenderer(
            this._terrainContainer,
            spriteSheets,
            this._tilesContainer,
            this._terrainContainer,
            this._overlayContainer,
            this._overlayContainer,
        );
        this._worldRenderer = new WorldRenderer(seed, spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);
        this._effectRenderer = new EffectRenderer(spriteSheets, this._terrainContainer, this._overlayContainer);
        this.registerListeners();
    }

    private registerListeners() {
        this._eventBus.on(NetworkEvent.ENTITIES_INIT, (players: EntityInfo[]) => {
            for (const player of players) {
                this._entityRenderer.addEntity(player);
            }
            this._entityRenderer.syncEntities(players);
            this._scoreBoard.setPlayers(this.asPlayers(players));
        });

        this._eventBus.on(EntityEvent.UPDATED, (player: EntityInfo) => {
            this._entityRenderer.syncEntities([player]);
            this.tryUpdateScore(player);
        });

        this._eventBus.on(EntityCommand.MOVE, (data: { entityId: string; position: Position; }) => {
            this._entityRenderer.syncPosition([data]);
        });

        this._eventBus.on(EntityEvent.SYNC, (entity: EntityInfo) => {
            this._entityRenderer.syncEntities([entity]);
            this.tryUpdateScore(entity);
        });

        this._eventBus.on(EntityEvent.POSITION_UPDATED, (res: { entityId: string; position: Position; }) => {
            this._entityRenderer.syncPosition([res]);
        });

        this._eventBus.on(EntityEvent.ADDED, (player: EntityInfo) => {
            this._entityRenderer.addEntity(player);
            this._entityRenderer.syncEntities([player]);
            this.tryUpdateScore(player);
        });

        this._eventBus.on(LocalPlayerEvent.LEFT, (playerId: string) => {
            this._entityRenderer.removeEntity(playerId);
            this._scoreBoard.remove(playerId);
        });

        this._eventBus.on(EntityEvent.DIED, (res) => {
            this._entityRenderer.entityDied(res.entityInfo, this.onDeathAnimationFinished);
            this._scoreBoard.remove(res.entityInfo.id);
        });

        this._eventBus.on(LocalPlayerEvent.ATTACK_RESULT, (res: { entityId: string; attackResult: AttackResult; }) => {
            this._entityRenderer.showDmgPopup(res.attackResult);
        });

        this._eventBus.on(LocalPlayerEvent.TELEPORT_DESTINATION_HELPER, (position) => {
            this._effectRenderer.renderTpDestination(position ?? undefined);
        });
    }

    private tryUpdateScore(entity: EntityInfo) {
        if (entity.entityType !== EntityType.PLAYER) return;
        this._scoreBoard.update(entity as PlayerInfo);
    }

    private asPlayers(entities: EntityInfo[]): PlayerInfo[] {
        return entities.filter(e => e.entityType === EntityType.PLAYER) as PlayerInfo[];
    }

    updateMinimap(localPlayer: Player) {
        const playersArray = Array.from(GameState.instance.entities.values()).map(p => ({
            id: p.id,
            x: p.position.x,
            y: p.position.y,
        }));

        if (localPlayer) {
            this._minimap.update(
                localPlayer.position.x,
                localPlayer.position.y,
                playersArray
            );
        }
    }

    update(delta: number, localPlayer?: { x: number; y: number; vx?: number; vy?: number } | null) {
        this._entityRenderer.update(delta);
        this._worldAtmosphere.update(delta);
        this._worldRenderer.updateInteractive(delta, localPlayer ?? null);
    }

    updateCamera(position: Position) {
        this._camera.follow(position, this._pixiApp.screen.width, this._pixiApp.screen.height);
        this._globalContainer.x = this._camera.x;
        this._globalContainer.y = this._camera.y;
    }

    public get camera(): CameraService {
        return this._camera;
    }

    public get playersRenderer(): EntityRenderer {
        return this._entityRenderer;
    }

    public get worldRenderer(): WorldRenderer {
        return this._worldRenderer;
    }
}
