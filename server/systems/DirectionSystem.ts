import { ServerState } from "../ServerState";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";
import { EntityState } from "../../shared/messages/EntityState";
import { Direction } from "../../shared/enums/Direction";
import { LivingEntity } from "../../shared/entities/LivingEntity";

export class DirectionSystem {
    constructor(private eventBus: EventBus, private serverState: ServerState) { }

    handleDirectionUpdate(entityId: string, direction: { dx: number; dy: number; }, movingDirection: Direction, state: EntityState) {
        const player = this.serverState.getEntity(entityId) as LivingEntity;
        if (!player) return;
        player.movingVector = direction;
        player.state = state;
        player.movingDirection = movingDirection;
        this.eventBus.emit(EntityEvent.UPDATED, player.toInfo())
        // this.eventBus.emit(EntityEvent.DIRECTION_CHANGED, { playerInfo: this.serverState.getEntity(playerInfo.id).toInfo(), socket: socket })
    }
}
