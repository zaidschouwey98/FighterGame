import { Action } from "../../../shared/Action";
import type Player from "../../../shared/Player";
import { NetworkClient } from "../network/NetworkClient";
import { InputHandler } from "./InputHandler";

export class MovementService {
    constructor(private inputHandler: InputHandler, private network: NetworkClient) {}

    public handleMovement(player: Player, delta: number) {
        let dx = 0, dy = 0;

        if (this.inputHandler.getKeys().has("w")) dy -= 1;
        if (this.inputHandler.getKeys().has("s")) dy += 1;
        if (this.inputHandler.getKeys().has("a")) dx -= 1;
        if (this.inputHandler.getKeys().has("d")) dx += 1;

        let newAction = player.currentAction;

        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            player.position.x += dx * player.speed * 16 * delta / 60;
            player.position.y += dy * player.speed * 16 * delta / 60;

            if (dx > 0) newAction = Action.MOVE_RIGHT;
            else if (dx < 0) newAction = Action.MOVE_LEFT;
            else if (dy > 0) newAction = Action.MOVE_DOWN;
            else if (dy < 0) newAction = Action.MOVE_TOP;
        } else {
            newAction = this.computeIdleAction(player.currentAction);
        }

        player.currentAction = newAction;
        this.network.move({ x: player.position.x, y: player.position.y }, player.currentAction);
    }

    private computeIdleAction(currentAction: Action): Action {
        switch (currentAction) {
            case Action.MOVE_RIGHT: return Action.IDLE_RIGHT;
            case Action.MOVE_LEFT:  return Action.IDLE_LEFT;
            case Action.MOVE_TOP:   return Action.IDLE_TOP;
            default: return Action.IDLE_DOWN;
        }
    }
}
