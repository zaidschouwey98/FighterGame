import type { Application } from "pixi.js";

export class CoordinateService {
    private app: Application;
    private scale: number = 4; // Votre scale

    constructor(app: Application, scale: number = 4) {
        this.app = app;
        this.scale = scale;
    }

    public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        const rect = this.app.view.getBoundingClientRect();
        
        // Ajouter le scale dans le calcul
        return {
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }

    public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        const rect = this.app.view.getBoundingClientRect();
        
        return {
            x: (worldX * this.scale) + rect.left,
            y: (worldY * this.scale) + rect.top
        };
    }

    public setScale(scale: number): void {
        this.scale = scale;
    }
}