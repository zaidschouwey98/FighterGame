import { Application, Container, Spritesheet } from "pixi.js";
import PlayerRenderer from "./PlayerRenderer";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";
import { Minimap } from "./Minimap";
import { GameState } from "../core/GameState";
import { HpBar } from "./HpBar";

export class Renderer {

    private _pixiApp: Application;

    private _minimap: Minimap;

    private _globalContainer: Container;
    private _tilesContainer: Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private _overlayContainer: Container;
    private _uiContainer: Container;

    private _playerRenderer: PlayerRenderer;
    private _worldRenderer: WorldRenderer;

    private _camera: CameraService;
    private _hpBar: HpBar;

    constructor(app: Application, globalContainer: Container, spriteSheets: Spritesheet[], seed: string = "seed") {
        this._camera = new CameraService();

        this._pixiApp = app;

        this._globalContainer = globalContainer;
        this._tilesContainer = new Container({ label: "tiles_container" });
        this._terrainContainer = new Container({ label: "terrain_container" });
        this._objectContainer = new Container({ label: "object_container" });
        this._overlayContainer = new Container({ label: "overlay_container" });
        this._uiContainer = new Container({ label: "ui_container" });

        globalContainer.scale.set(this._camera.zoom);
        globalContainer.addChild(this._tilesContainer);
        globalContainer.addChild(this._terrainContainer);
        globalContainer.addChild(this._objectContainer);
        globalContainer.addChild(this._overlayContainer);
        app.stage.addChild(this._uiContainer)

        this._minimap = new Minimap(app, this._uiContainer, 200);
        this._hpBar = new HpBar(this._uiContainer, 100, 100, 200, 60);
        this._playerRenderer = new PlayerRenderer(this._objectContainer, spriteSheets, this._terrainContainer, this._terrainContainer); // todo Old was overlay (the right one)
        this._worldRenderer = new WorldRenderer(seed, spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);


    }

    updateMinimap(localPlayerId: string) {
        // Dans ton update
        const localPlayer = GameState.instance.players.get(localPlayerId!);
        const playersArray = Array.from(GameState.instance.players.values()).map(p => ({
            id: p.id,
            x: p.position.x,
            y: p.position.y,
            isLocal: p.id === localPlayerId
        }));

        if (localPlayer) {
            this._minimap.update(
                localPlayer.position.x,
                localPlayer.position.y,
                playersArray
            );
        }
    }

    updateHealthBar(currentHealth:number, maxHealth:number){
        this._hpBar.update(currentHealth, maxHealth)
    }

    updateCamera(position: Position) {
        this._camera.follow(position, this._pixiApp.screen.width, this._pixiApp.screen.height);
        this._globalContainer.x = this._camera.x;
        this._globalContainer.y = this._camera.y;
    }

    public get camera(): CameraService {
        return this._camera;
    }

    public get playerRenderer(): PlayerRenderer {
        return this._playerRenderer;
    }

    public get worldRenderer(): WorldRenderer {
        return this._worldRenderer;
    }

}