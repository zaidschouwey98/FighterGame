import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";
import { EntityState } from "../../shared/messages/EntityState";
import { Direction } from "../../shared/enums/Direction";

export class DirectionSystem {
    constructor(private eventBus: EventBus, private serverState: ServerState) { }

    handleDirectionUpdate(entityId: string, direction: { dx: number; dy: number; }, movingDirection: Direction, state: EntityState, socket?: Socket) {
        const player = this.serverState.getEntity(entityId);
        if (!player) return;
        player.movingVector = direction;
        player.state = state;
        player.movingDirection = movingDirection;
        this.eventBus.emit(EntityEvent.UPDATED, player.toInfo())
        // this.eventBus.emit(EntityEvent.DIRECTION_CHANGED, { playerInfo: this.serverState.getEntity(playerInfo.id).toInfo(), socket: socket })
    }
}
