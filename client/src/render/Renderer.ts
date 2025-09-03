import { Container, Spritesheet } from "pixi.js";
import PlayerRenderer from "./PlayerRenderer";
import { WorldRenderer } from "./WorldRenderer";

export class Renderer{
    private _tilesContainer:Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private _overlayContainer: Container;
    private _uiContainer: Container;
 
    private _playerRenderer: PlayerRenderer;
    private _worldRenderer: WorldRenderer;

    constructor(globalContainer:Container, spriteSheets: Spritesheet[], seed:string = "seed"){ 
        this._tilesContainer = new Container();
        this._terrainContainer = new Container();
        this._objectContainer = new Container();
        this._overlayContainer = new Container();
        this._uiContainer = new Container();

        globalContainer.addChild(this._tilesContainer);
        globalContainer.addChild(this._terrainContainer);
        globalContainer.addChild(this._objectContainer);
        globalContainer.addChild(this._overlayContainer);
        globalContainer.addChild(this._uiContainer);

        this._playerRenderer = new PlayerRenderer(this._objectContainer,spriteSheets,this._overlayContainer);
        this._worldRenderer = new WorldRenderer(seed,spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);
    }

    
    public get playerRenderer() : PlayerRenderer {
        return this._playerRenderer;
    }
    
    public get worldRenderer() : WorldRenderer {
        return this._worldRenderer;
    }

}