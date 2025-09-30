import { Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";
import { EntityInfo } from "../../shared/messages/EntityInfo";

export class UpdateSystem {
    constructor(private eventBus:EventBus, private serverState: ServerState) { }

    handleEntityUpdated(playerInfo: EntityInfo) {
        const player = this.serverState.getEntity(playerInfo.id);
        if (!player) return;

        this.serverState.updateEntity(playerInfo);
        this.eventBus.emit(EntityEvent.UPDATED,this.serverState.getEntity(playerInfo.id).toInfo());
    }
}
