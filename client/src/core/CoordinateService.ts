import type { Application } from "pixi.js";
import type { CameraService } from "./CameraService";

export class CoordinateService {
  constructor(
    private app: Application,
    private camera: CameraService,
  ) {}

  screenToWorld(screenX: number, screenY: number) {
    const rect = this.app.view.getBoundingClientRect();
    const zoom = this.camera.zoom;
    return {
      x: (screenX - rect.left - this.camera.x) / zoom,
      y: (screenY - rect.top  - this.camera.y) / zoom,
    };
  }

  worldToScreen(worldX: number, worldY: number) {
    const rect = this.app.view.getBoundingClientRect();
    const zoom = this.camera.zoom;
    return {
      x: worldX * zoom + this.camera.x + rect.left,
      y: worldY * zoom + this.camera.y + rect.top,
    };
  }
}