import type Position from "../../../shared/Position";
import { CAMERA_ZOOM, TILE_SIZE } from "../constantes";

export class CameraService {
    public x = 0;
    public y = 0;
    private smoothness = 0.1; // entre 0 (lent) et 1 (instantané)

    follow(position:Position, screenWidth: number, screenHeight: number) {
        const targetX = screenWidth / 2 - position.x * this.zoom - TILE_SIZE;
        const targetY = screenHeight / 2 - position.y * this.zoom - TILE_SIZE;

        // Interpolation linéaire
        this.x += (targetX - this.x) * this.smoothness;
        this.y += (targetY - this.y) * this.smoothness;
    }

    get zoom() {
        return CAMERA_ZOOM;
    }
}