import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";

export class DirectionSystem {
    constructor(private eventBus: EventBus, private serverState: ServerState) { }

    handleDirectionUpdate(entityId: string, direction: { dx: number; dy: number; }, socket?: Socket) {
        const player = this.serverState.getEntity(entityId);
        if (!player) return;
        player.movingVector = direction;
        this.eventBus.emit(EntityEvent.UPDATED, player.toInfo())
        // this.eventBus.emit(EntityEvent.DIRECTION_CHANGED, { playerInfo: this.serverState.getEntity(playerInfo.id).toInfo(), socket: socket })
    }
}
