import { Server, Socket } from "socket.io";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackResult } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";

export class SocketIoAdapter {
    constructor(private eventBus: EventBus) {
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (res:{attackResult: AttackResult,socket:Socket}) => {
            res.socket.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
            res.socket.broadcast.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
        });
        
        this.eventBus.on(EventBusMessage.START_ATTACK, (res:{playerInfo:PlayerInfo, socket:Socket})=>{
            res.socket.broadcast.emit(ServerToSocketMsg.START_ATTACK, res.playerInfo);
        });

        this.eventBus.on(EventBusMessage.PLAYER_DIED, (res:{playerId:string,socket:Socket})=>{
            res.socket.emit(ServerToSocketMsg.PLAYER_DIED, {id:res.playerId})
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_DIED, {id:res.playerId});
        })

        this.eventBus.on(EventBusMessage.PLAYER_DIRECTION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_DIRECTION_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_POSITION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_POS_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_UPDATE, res.playerInfo);
        })
    }
}
