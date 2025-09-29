import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import Position from "../../shared/Position";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";

export class MovementSystem {
    constructor(private eventBus:EventBus, private serverState: ServerState) { }

    handlePosUpdated(entityId: string, newPos: Position, socket?: Socket){
        const player = this.serverState.getEntity(entityId);
        if (!player) return;
        player.position = newPos;
        
        this.eventBus.emit(EntityEvent.POSITION_UPDATED, {entityId:entityId,position:newPos});
        // this.eventBus.emit(EventBusMessage.ENTITY_POSITION_UPDATED, {playerInfo:this.serverState.getEntity(playerInfo.id).toInfo(),socket:socket})
    }
}
