import { Application, Container, Spritesheet } from "pixi.js";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";
import { Minimap } from "./UI/Minimap";
import { GameState } from "../core/GameState";
import type PlayerInfo from "../../../shared/PlayerInfo";
import { EventBusMessage, type EventBus } from "../../../shared/services/EventBus";
import type { Player } from "../../../shared/player/Player";
import { ScoreBoard } from "./UI/ScoreBoard";
import EntityRenderer from "./EntityRenderer";
import type { EntityInfo } from "../../../shared/EntityInfo";
import type { AttackResult } from "../../../shared/AttackResult";

export class Renderer {
    private _eventBus: EventBus;

    private _pixiApp: Application;

    private _minimap: Minimap;

    private _globalContainer: Container;
    private _tilesContainer: Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private _overlayContainer: Container;
    private _uiContainer: Container;

    private _entityRenderer: EntityRenderer;
    private _worldRenderer: WorldRenderer;

    private _camera: CameraService;
    private _scoreBoard: ScoreBoard;

    constructor(app: Application, rootContainer: Container, spriteSheets: Spritesheet[], eventBus: EventBus, seed: string = "seed", private onDeathAnimationFinished:(entityId:string)=>void) {
        this._eventBus = eventBus;
        this._camera = new CameraService();

        this._pixiApp = app;
        const globalContainer = new Container();
        this._globalContainer = globalContainer;
        this._tilesContainer = new Container({ label: "tiles_container" });
        this._terrainContainer = new Container({ label: "terrain_container" });
        this._objectContainer = new Container({ label: "object_container" });
        this._overlayContainer = new Container({ label: "overlay_container" });
        this._uiContainer = new Container({ label: "ui_container" });

        this._uiContainer.x = app.canvas.width - 400; // Haut droite
        this._uiContainer.y = 20;

        globalContainer.scale.set(this._camera.zoom);
        globalContainer.addChild(this._tilesContainer);
        globalContainer.addChild(this._terrainContainer);
        globalContainer.addChild(this._objectContainer);
        globalContainer.addChild(this._overlayContainer);
        globalContainer.addChild(this._uiContainer);
        rootContainer.addChild(globalContainer);
        rootContainer.addChild(this._uiContainer); // follows the camera
        this._scoreBoard = new ScoreBoard(this._uiContainer)
        this._minimap = new Minimap(this._uiContainer, 200);
        this._entityRenderer = new EntityRenderer(this._objectContainer, spriteSheets, this._terrainContainer, this._terrainContainer); // todo Old was overlay (the right one)
        this._worldRenderer = new WorldRenderer(seed, spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);

        this.registerListeners();
    }

    private registerListeners() {
        this._eventBus.on(EventBusMessage.ENTITIES_INIT, (players: PlayerInfo[]) => {
            for (const player of players) {
                this._entityRenderer.addEntity(player);
            }
            this._entityRenderer.syncEntities(players);
        })

        // Quand un joueur est mis à jour
        this._eventBus.on(EventBusMessage.ENTITY_UPDATED, (player: PlayerInfo) => {
            this._entityRenderer.syncEntities([player]);
            this._scoreBoard.update(player);
        });

        this._eventBus.on(EventBusMessage.ENTITY_SYNC, (entity: EntityInfo) => {
            this._entityRenderer.syncEntities([entity]);
        });

        this._eventBus.on(EventBusMessage.ENTITY_POSITION_UPDATED, (player:PlayerInfo)=>{
            this._entityRenderer.syncPosition([player])
        })

        // Nouvel arrivant
        this._eventBus.on(EventBusMessage.ENTITY_ADDED, (player: PlayerInfo) => {
            this._entityRenderer.addEntity(player);
            this._entityRenderer.syncEntities([player]);
        });

        // Joueur parti
        this._eventBus.on(EventBusMessage.PLAYER_LEFT, (playerId: string) => {
            this._entityRenderer.removeEntity(playerId);
        });

        this._eventBus.on(EventBusMessage.ENTITY_DIED, (entityInfo:EntityInfo) => {
            this._entityRenderer.entityDied(entityInfo, this.onDeathAnimationFinished);
        });

        this._eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult: AttackResult)=>{
            this._entityRenderer.showDmgPopup(attackResult);
        });
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

    update(delta:number){
        this._entityRenderer.update(delta);
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