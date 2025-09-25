import { Server, Socket } from "socket.io";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackResult } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";

export class SocketIoAdapter {
    constructor(private eventBus: EventBus, private serverSocket:Server) {
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (res:{attackResult: AttackResult,socket:Socket}) => {
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
                return;
            }
            res.socket.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
            res.socket.broadcast.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
        });
        
        this.eventBus.on(EventBusMessage.START_ATTACK, (res:{playerInfo:PlayerInfo, socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.START_ATTACK, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.START_ATTACK, res.playerInfo);
        });

        this.eventBus.on(EventBusMessage.PLAYER_DIED, (res:{playerInfo:PlayerInfo,socket:Socket, killerId:string})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.PLAYER_DIED, res.playerInfo);
                return;
            }
            res.socket.emit(ServerToSocketMsg.PLAYER_DIED, res.playerInfo)
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_DIED, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_DIRECTION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.PLAYER_DIRECTION_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_DIRECTION_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_POSITION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.PLAYER_POS_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_POS_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.PLAYER_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.PLAYER_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.PLAYER_SYNC, (playerInfo:PlayerInfo)=>{
            this.serverSocket.emit(ServerToSocketMsg.PLAYER_SYNC, playerInfo);
        })
    }
}
