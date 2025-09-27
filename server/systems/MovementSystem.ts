import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";

export class MovementSystem {
    constructor(private eventBus:EventBus, private serverState: ServerState) { }

    handlePosUpdated(playerInfo:PlayerInfo, socket?: Socket){
        const player = this.serverState.getEntity(playerInfo.id);
        if (!player) return;

        this.serverState.updatePlayer(playerInfo);
        this.eventBus.emit(EventBusMessage.ENTITY_POSITION_UPDATED, {playerInfo:this.serverState.getEntity(playerInfo.id).toInfo(),socket:socket})
    }
}
