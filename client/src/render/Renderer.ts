import { Application, Container, Spritesheet } from "pixi.js";
import PlayerRenderer from "./PlayerRenderer";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";

export class Renderer{

    private _pixiApp: Application;

    private _globalContainer:Container;
    private _tilesContainer:Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private _overlayContainer: Container;
    private _uiContainer: Container;
 
    private _playerRenderer: PlayerRenderer;
    private _worldRenderer: WorldRenderer;

    private _camera: CameraService;

    constructor(app:Application, globalContainer:Container, spriteSheets: Spritesheet[], seed:string = "seed"){ 
        this._camera = new CameraService();

        this._pixiApp = app;

        this._globalContainer = globalContainer;
        this._tilesContainer = new Container();
        this._terrainContainer = new Container();
        this._objectContainer = new Container();
        this._overlayContainer = new Container();
        this._uiContainer = new Container();

        globalContainer.scale.set(this._camera.zoom);
        globalContainer.addChild(this._tilesContainer);
        globalContainer.addChild(this._terrainContainer);
        globalContainer.addChild(this._objectContainer);
        globalContainer.addChild(this._overlayContainer);
        globalContainer.addChild(this._uiContainer);

        this._playerRenderer = new PlayerRenderer(this._objectContainer,spriteSheets,this._overlayContainer);
        this._worldRenderer = new WorldRenderer(seed,spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);

        
    }

    updateCamera(position:Position){
        this._camera.follow(position, this._pixiApp.screen.width, this._pixiApp.screen.height);
        this._globalContainer.x = this._camera.x;
        this._globalContainer.y = this._camera.y;
    }

    public get camera(): CameraService{
        return this._camera;
    }
    
    public get playerRenderer() : PlayerRenderer {
        return this._playerRenderer;
    }
    
    public get worldRenderer() : WorldRenderer {
        return this._worldRenderer;
    }

}