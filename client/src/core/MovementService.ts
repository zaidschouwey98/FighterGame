import { PlayerState } from "../../../shared/PlayerState";
import type Player from "./player/Player";
import { NetworkClient } from "../network/NetworkClient";
import { InputHandler } from "./InputHandler";
import { TILE_SIZE } from "../constantes";

export class MovementService {
    private isMoving:boolean = false;
    constructor(private inputHandler: InputHandler, private network: NetworkClient) {}

    public handleMovement(player: Player, delta: number) {
        let dx = 0, dy = 0;

        if (this.inputHandler.getKeys().has("w")) dy -= 1;
        if (this.inputHandler.getKeys().has("s")) dy += 1;
        if (this.inputHandler.getKeys().has("a")) dx -= 1;
        if (this.inputHandler.getKeys().has("d")) dx += 1;

        if (dx !== 0 || dy !== 0) {
            this.isMoving = true;
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            player.position.x += dx * player.speed * TILE_SIZE * delta / 60; 
            player.position.y += dy * player.speed * TILE_SIZE * delta / 60;
            player.setState(PlayerState.MOVING);
            this.network.move({ x: player.position.x, y: player.position.y }, PlayerState.MOVING);    
        } else {
            
            if(this.isMoving){
                this.isMoving = false;
                player.setState(PlayerState.IDLE);
                this.network.stopMoving(player.getState());
            }
        }
    }
}
