import { PlayerState } from "../../../../../shared/PlayerState";
import { EventBusMessage, type EventBus } from "../../EventBus";
import type Player from "../Player";
import { BaseState } from "./BaseState";

export class KnockBackState extends BaseState {
    readonly name = PlayerState.KNOCKBACK;
    constructor(player: Player, private eventBus: EventBus) {
        super(player);
    }

    enter() {
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        if (this.player.knockbackTimer && this.player.knockbackTimer > 0 && this.player.knockbackReceivedVector) {
            this.player.position.x += this.player.knockbackReceivedVector.x * delta;
            this.player.position.y += this.player.knockbackReceivedVector.y * delta;
            // Ralentissement progressif
            this.player.knockbackReceivedVector.x *= 0.85;
            this.player.knockbackReceivedVector.y *= 0.85;

            this.player.knockbackTimer -= delta;
            if (this.player.knockbackTimer <= 0) {
                this.player.knockbackReceivedVector = undefined;
                this.player.knockbackTimer = undefined;
                this.player.changeState(this.player.idleState);
            }
            this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo())
        }
    }

    exit() {
        // Nettoyage knockback
        this.player.knockbackReceivedVector = undefined;
        this.player.knockbackTimer = undefined;
    }
}