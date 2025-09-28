import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EntityEvent, EventBus } from "../../services/EventBus";

export class TeleportedState extends BaseState {
    readonly name = EntityState.TELEPORTED;
    private timer = 10;

    constructor(
        player: IStatefulEntity,
        private eventBus: EventBus,
    ) {
        super(player);
    }

    enter() {
        this.eventBus.emit(EntityEvent.UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        this.timer -= delta;
        if (this.timer <= 0) {
            this.entity.changeState(EntityState.IDLE);
            return;
        }
    }
    exit() { 

    }
}
