import { Application, Container, Spritesheet } from "pixi.js";
import PlayersRenderer from "./Player/PlayersRenderer";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";
import { Minimap } from "./UI/Minimap";
import { GameState } from "../core/GameState";
import type PlayerInfo from "../../../shared/PlayerInfo";
import { EventBusMessage, type EventBus } from "../../../shared/services/EventBus";
import type { Player } from "../../../shared/player/Player";
import { ScoreBoard } from "./UI/ScoreBoard";

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

    private _playersRenderer: PlayersRenderer;
    private _worldRenderer: WorldRenderer;

    private _camera: CameraService;
    private _scoreBoard: ScoreBoard;

    constructor(app: Application, rootContainer: Container, spriteSheets: Spritesheet[], eventBus: EventBus, seed: string = "seed") {
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
        this._playersRenderer = new PlayersRenderer(this._objectContainer, spriteSheets, this._terrainContainer, this._terrainContainer); // todo Old was overlay (the right one)
        this._worldRenderer = new WorldRenderer(seed, spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);

        this.registerListeners();
    }

    private registerListeners() {
        this._eventBus.on(EventBusMessage.PLAYERS_INIT, (players: PlayerInfo[]) => {
            for (const player of players) {
                this._playersRenderer.addNewPlayer(player);
            }
            this._playersRenderer.syncPlayers(players);
        })

        // Quand un joueur est mis à jour
        this._eventBus.on(EventBusMessage.PLAYER_UPDATED, (player: PlayerInfo) => {
            this._playersRenderer.syncPlayers([player]);
            this._scoreBoard.update(player);
        });

        this._eventBus.on(EventBusMessage.PLAYER_POSITION_UPDATED, (player:PlayerInfo)=>{
            this._playersRenderer.syncPosition([player])
        })

        // Nouvel arrivant
        this._eventBus.on(EventBusMessage.PLAYER_JOINED, (player: PlayerInfo) => {
            this._playersRenderer.addNewPlayer(player);
            this._playersRenderer.syncPlayers([player]);
        });

        // Joueur parti
        this._eventBus.on(EventBusMessage.PLAYER_LEFT, (playerId: string) => {
            this._playersRenderer.removePlayer(playerId);
        });

        this._eventBus.on(EventBusMessage.PLAYER_DIED, (player) => {
            this._playersRenderer.removePlayer(player.id)
        });
    }

    updateMinimap(localPlayer: Player) {
        const playersArray = Array.from(GameState.instance.players.values()).map(p => ({
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
        this._playersRenderer.update(delta);
    }

    updateCamera(position: Position) {
        this._camera.follow(position, this._pixiApp.screen.width, this._pixiApp.screen.height);
        this._globalContainer.x = this._camera.x;
        this._globalContainer.y = this._camera.y;
    }

    public get camera(): CameraService {
        return this._camera;
    }

    public get playersRenderer(): PlayersRenderer {
        return this._playersRenderer;
    }


    public get worldRenderer(): WorldRenderer {
        return this._worldRenderer;
    }

}