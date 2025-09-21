import { PlayerState } from "../../../../../shared/PlayerState";
import { EventBusMessage, type EventBus } from "../../EventBus";
import type { InputHandler } from "../../InputHandler";
import type Player from "../Player";
import { BaseState } from "./BaseState";

export class KnockBackState extends BaseState {
    readonly name = PlayerState.KNOCKBACK;
    constructor(
        player: Player,
        private eventBus: EventBus,
        private inputHandler: InputHandler,
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

            const decayPerSecond = 0.85;
            const decay = Math.pow(decayPerSecond, delta);
            this.knockbackVector.x *= decay;
            this.knockbackVector.y *= decay;

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