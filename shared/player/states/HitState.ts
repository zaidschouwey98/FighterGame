import { PlayerState } from "../../PlayerState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import type { Player } from "../Player";
import { BaseState } from "./BaseState";

export class HitState extends BaseState {
    readonly name = PlayerState.HIT;
    constructor(
        player: Player,
        private eventBus: EventBus,
        private inputHandler: IInputHandler,
        private knockbackVector: { x: number; y: number },
        private knockbackTimer: number
    ) {
        super(player);
    }

    enter() {
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        if (this.inputHandler.consumeSpaceClick()) {
            this.player.changeState(this.player.teleportState);
        }

        if (this.knockbackTimer > 0) {
            this.player.position.x += this.knockbackVector.x * delta;
            this.player.position.y += this.knockbackVector.y * delta;

            this.knockbackVector.x *= 0.85;
            this.knockbackVector.y *= 0.85;

            this.knockbackTimer -= delta;
            if (this.knockbackTimer <= 0) {
                this.player.changeState(this.player.idleState);
            }

            this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
        }
    }

    exit() {

    }
}