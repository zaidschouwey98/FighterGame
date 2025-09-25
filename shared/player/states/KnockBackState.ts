import { EntityState } from "../../PlayerState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import type { Player } from "../Player";
import { BaseState } from "./BaseState";
import { ClientPlayer } from "../ClientPlayer";

export class KnockBackState extends BaseState {
    readonly name = EntityState.KNOCKBACK;
    constructor(
        player: ClientPlayer,
        private eventBus: EventBus,
        private inputHandler: IInputHandler,
        private knockbackVector: { dx: number; dy: number },
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
            this.player.position.x += this.knockbackVector.dx * delta;
            this.player.position.y += this.knockbackVector.dy * delta;

            const decayPerSecond = 0.85;
            const decay = Math.pow(decayPerSecond, delta);
            this.knockbackVector.dx *= decay;
            this.knockbackVector.dy *= decay;

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