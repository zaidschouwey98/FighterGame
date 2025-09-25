import { Server, Socket } from "socket.io";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackResult } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";
import { EntityInfo } from "../../shared/EntityInfo";

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

        this.eventBus.on(EventBusMessage.ENTITY_DIED, (res:{playerInfo:PlayerInfo,socket:Socket, killerId:string})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_DIED, res.playerInfo);
                return;
            }
            res.socket.emit(ServerToSocketMsg.ENTITY_DIED, res.playerInfo)
            res.socket.broadcast.emit(ServerToSocketMsg.ENTITY_DIED, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.ENTITY_ADDED, (res:{entityInfo:EntityInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.NEW_ENTITY, res.entityInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.NEW_ENTITY, res.entityInfo);
        })

        this.eventBus.on(EventBusMessage.ENTITY_DIRECTION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.ENTITY_POSITION_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_POS_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.ENTITY_POS_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.ENTITY_UPDATED, (res:{playerInfo:PlayerInfo,socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_UPDATE, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.ENTITY_UPDATE, res.playerInfo);
        })

        this.eventBus.on(EventBusMessage.ENTITY_SYNC, (playerInfo:PlayerInfo)=>{
            this.serverSocket.emit(ServerToSocketMsg.ENTITY_SYNC, playerInfo);
        })
    }
}
