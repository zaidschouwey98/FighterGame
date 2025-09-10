import { Application, Container, Spritesheet } from "pixi.js";
import type { IScene } from "./IScene";
import { MenuOverlay } from "../overlay/MenuOverlay";
import { GameController } from "../GameController"
import { DeathOverlay } from "../overlay/DeathOverlay";

export class GameScene implements IScene {
  container = new Container();
  private gameController: GameController;
  private overlay?: MenuOverlay;
  private deathOverlay?: DeathOverlay;

  constructor(
    private serverUrl: string,
    private app: Application,
    private spritesheets: Spritesheet[]
  ) {
    this.gameController = new GameController(
      this.container,
      this.serverUrl,
      this.app,
      this.spritesheets,
      {
        onDeath: () => this.showDeathOverlay(),
        onRespawn: () => this.hideDeathOverlay(),
      }
    );
  }

  init(): void {
    this.overlay = new MenuOverlay((name) => this.startGame(name));
    this.overlay.init();
  }

  private showDeathOverlay() {
    if (this.deathOverlay) return;
    this.deathOverlay = new DeathOverlay(() => {
      this.gameController.requestRespawn();
    });
    this.deathOverlay.init();
  }

  private hideDeathOverlay() {
    this.deathOverlay?.destroy();
    this.deathOverlay = undefined;
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
