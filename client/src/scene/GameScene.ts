import { Application, Container, Spritesheet } from "pixi.js";
import type { IScene } from "./IScene";
import { MenuOverlay } from "../MenuOverlay";
import { GameController } from "../GameController"

export class GameScene implements IScene {
  container = new Container();
  private gameController: GameController;
  private overlay?: MenuOverlay;

  constructor(
    private serverUrl: string,
    private app: Application,
    private spritesheets: Spritesheet[]
  ) {
    this.gameController = new GameController(
      this.container,
      this.serverUrl,
      this.app,
      this.spritesheets
    );
  }

  init(): void {
    this.overlay = new MenuOverlay((name) => this.startGame(name));
    this.overlay.init();
  }

  private startGame(name: string) {
    this.overlay?.destroy();
    this.overlay = undefined;
    this.gameController.spawnLocalPlayer(name);
  }

  update(delta: number): void {
    this.gameController.update(delta);
  }

  destroy(): void {
    this.container.removeChildren();
    this.overlay?.destroy();
  }
}
