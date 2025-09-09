import { PlayerState } from "../../../shared/PlayerState";
import type Player from "./player/Player";
import { InputHandler } from "./InputHandler";
import { TILE_SIZE } from "../constantes";
import { EventBusMessage, type EventBus } from "./EventBus";
import { Direction } from "../../../shared/Direction";

export class MovementService {
    private isMoving: boolean = false;
    constructor(private inputHandler: InputHandler, private eventBus: EventBus) { }

    public handleMovement(player: Player, delta: number) {
        let dx = 0, dy = 0;

        if (this.inputHandler.getKeys().has("w")) {
            dy -= 1;
            player.movingDirection = Direction.TOP;
        };
        if (this.inputHandler.getKeys().has("s")) {
            dy += 1;
            player.movingDirection = Direction.BOTTOM;
        }
        if (this.inputHandler.getKeys().has("a")) {
            dx -= 1
            player.movingDirection = Direction.LEFT;
        };
        if (this.inputHandler.getKeys().has("d")) {
            dx += 1
            player.movingDirection = Direction.RIGHT;
        };

        if (dx !== 0 || dy !== 0) {
            this.isMoving = true;
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            player.position.x += dx * player.speed * TILE_SIZE * delta / 60;
            player.position.y += dy * player.speed * TILE_SIZE * delta / 60;

            player.setState(PlayerState.MOVING);
            this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player);
        } else {

            if (this.isMoving) {
                this.isMoving = false;
                player.setState(PlayerState.IDLE);
                this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player);

            }
        }
    }
}
