import { IInputHandler } from "../../../client/src/core/IInputHandler";
import { EntityState } from "../../PlayerState";
import Position from "../../Position";
import { EventBus, EventBusMessage } from "../../services/EventBus";
import { TeleportService } from "../../services/TeleportService";
import { ClientPlayer } from "../ClientPlayer";
import { BaseState } from "./BaseState";

export class TeleportedState extends BaseState {
    readonly name = EntityState.TELEPORTED;
    private timer = 10;

    constructor(
        player: ClientPlayer,
        private eventBus: EventBus,
    ) {
        super(player);
    }

    enter() {
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        this.timer -= delta;
        if (this.timer <= 0) {
            this.player.changeState(this.player.idleState);
            return;
        }
    }
    exit() { 

    }
}
