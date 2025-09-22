import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";

export class MovementSystem {
    constructor(private eventBus:EventBus, private serverState: ServerState) { }

    handlePosUpdated(playerInfo:PlayerInfo, socket?: Socket){
        const player = this.serverState.getPlayer(playerInfo.id);
        if (!player) return;

        this.serverState.updatePlayer(playerInfo);
        this.eventBus.emit(EventBusMessage.PLAYER_POSITION_UPDATED, {playerInfo:this.serverState.getPlayer(playerInfo.id),socket:socket})
    }
}
