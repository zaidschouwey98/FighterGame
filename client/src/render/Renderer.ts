import { Application, Container, Spritesheet } from "pixi.js";
import PlayersRenderer from "./Player/PlayersRenderer";
import { WorldRenderer } from "./WorldRenderer";
import { CameraService } from "../core/CameraService";
import type Position from "../../../shared/Position";
import { Minimap } from "./UI/Minimap";
import { GameState } from "../core/GameState";
import { HpBar } from "./UI/HpBar";
import type PlayerInfo from "../../../shared/PlayerInfo";
import { EventBusMessage, type EventBus } from "../core/EventBus";
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

    private _playersRenderer: PlayersRenderer;
    private _worldRenderer: WorldRenderer;

    private _camera: CameraService;
    private _hpBar: HpBar;

    constructor(app: Application, globalContainer: Container, spriteSheets: Spritesheet[], eventBus: EventBus, seed: string = "seed") {
        this._eventBus = eventBus;
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
        this._playersRenderer = new PlayersRenderer(this._objectContainer, spriteSheets, this._terrainContainer, this._terrainContainer); // todo Old was overlay (the right one)
        this._worldRenderer = new WorldRenderer(seed, spriteSheets, this._tilesContainer, this._terrainContainer, this._objectContainer);

        this.registerListeners();
    }

    private registerListeners() {
        this._eventBus.on(EventBusMessage.PLAYERS_INIT, (players: PlayerInfo[]) => {
            for (const player of players) {
                let p = GameState.instance.players.get(player.id);
                if (p) this._playersRenderer.addNewPlayer(p);
            }
        })

        // Quand un joueur est mis à jour
        this._eventBus.on(EventBusMessage.PLAYER_UPDATED, (player: PlayerInfo) => {
            const updated = GameState.instance.players.get(player.id);
            if (updated) {
                this._playersRenderer.updatePlayers([updated]);
            }
        });

        this._eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult: AttackResult) => {
            
        });

        // Nouvel arrivant
        this._eventBus.on(EventBusMessage.PLAYER_JOINED, (player: PlayerInfo) => {
            this._playersRenderer.addNewPlayer(GameState.instance.players.get(player.id)!);
        });

        // Joueur parti
        this._eventBus.on(EventBusMessage.PLAYER_LEFT, (playerId: string) => {
            this._playersRenderer.removePlayer(playerId);
        });


        // Joueur mort
        this._eventBus.on(EventBusMessage.PLAYER_DIED, (player: PlayerInfo) => {
            const dead = GameState.instance.players.get(player.id);
            // if (dead) this._playersRenderer.renderDyingPlayer(dead);
        });
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

    updateHealthBar(currentHealth: number, maxHealth: number) {
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


    public get playersRenderer(): PlayersRenderer {
        return this.playersRenderer;
    }


    public get worldRenderer(): WorldRenderer {
        return this._worldRenderer;
    }

}