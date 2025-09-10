import { Application } from "pixi.js";
import type { IScene } from "./IScene";

export class SceneManager {
  private currentScene: IScene | null = null;

  constructor(private app: Application) {}

  changeScene(scene: IScene) {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene.container);
    }
    this.currentScene = scene;
    this.currentScene.init();
    this.app.stage.addChild(scene.container);
  }

  update(delta: number) {
    this.currentScene?.update(delta);
  }
}
