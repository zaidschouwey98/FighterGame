import { Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";

export class UpdateSystem {
    constructor(private eventBus:EventBus, private serverState: ServerState) { }

    handlePlayerUpdated(playerInfo: PlayerInfo) {
        const player = this.serverState.getEntity(playerInfo.id);
        if (!player) return;

        this.serverState.updatePlayer(playerInfo);
        this.eventBus.emit(EntityEvent.UPDATED,this.serverState.getEntity(playerInfo.id).toInfo());
    }
}
