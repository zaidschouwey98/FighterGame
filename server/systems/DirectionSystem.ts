import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";

export class DirectionSystem {
    constructor(private io: Server, private serverState: ServerState) { }

    handleDirectionUpdate(socket: Socket | undefined, playerInfo: PlayerInfo) {
        const player = this.serverState.getPlayer(playerInfo.id);
        if (!player) return;
        
        this.serverState.updatePlayer(playerInfo)
        if(socket)
            socket.broadcast.emit(
                ServerToSocketMsg.PLAYER_DIRECTION_UPDATE,
                this.serverState.getPlayer(playerInfo.id)
            );
        else this.io.emit(ServerToSocketMsg.PLAYER_DIRECTION_UPDATE,
                this.serverState.getPlayer(playerInfo.id))
    }
}
