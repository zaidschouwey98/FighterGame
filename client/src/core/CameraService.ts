import type Position from "../../../shared/Position";
import { CAMERA_ZOOM, TILE_SIZE } from "../constantes";

export class CameraService {
    public x = 0;
    public y = 0;

    follow(position:Position, screenWidth: number, screenHeight: number) {
        this.x =  screenWidth / 2 - position.x  * this.zoom - TILE_SIZE;
        this.y = screenHeight / 2 - position.y  * this.zoom - TILE_SIZE;
    }

    get zoom() {
        return CAMERA_ZOOM;
    }
}