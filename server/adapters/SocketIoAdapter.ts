import { Server, Socket } from "socket.io";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackReceivedData, AttackResult, KnockbackData } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";
import { EntityInfo } from "../../shared/EntityInfo";
import { ServerState } from "../ServerState";

export class SocketIoAdapter {
    constructor(private eventBus: EventBus, private serverSocket:Server, private serverState: ServerState) {
        this.eventBus.on(EventBusMessage.ATTACK_RECEIVED, (res:{attackReceivedData: AttackReceivedData,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                // throw new Error("Should'nt be undefined")
                // this.serverSocket.emit(ServerToSocketMsg.ATTACK_RECEIVED, res.attackResult);
                // return;
                return;
            }
            playerSocket.emit(ServerToSocketMsg.ATTACK_RECEIVED, res.attackReceivedData);
        });

        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (res:{attackResult: AttackResult,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                return;
            }
            playerSocket.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
        });

        this.eventBus.on(EventBusMessage.ENTITY_RECEIVED_KNOCKBACK, (res:{knockbackData: KnockbackData,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                // throw new Error("Should'nt be undefined")
                // this.serverSocket.emit(ServerToSocketMsg.ATTACK_RECEIVED, res.attackResult);
                // return;
                return;
            }
            playerSocket.emit(ServerToSocketMsg.KNOCKBACK_RECEIVED, res.knockbackData);
        });
        
        this.eventBus.on(EventBusMessage.START_ATTACK, (res:{playerInfo:PlayerInfo, socket:Socket})=>{
            if(!res.socket){
                this.serverSocket.emit(ServerToSocketMsg.START_ATTACK, res.playerInfo);
                return;
            }
            res.socket.broadcast.emit(ServerToSocketMsg.START_ATTACK, res.playerInfo);
        });

        this.eventBus.on(EventBusMessage.ENTITY_DIED, (res:{entityInfo:EntityInfo, killerId:string})=>{
            this.serverSocket.emit(ServerToSocketMsg.ENTITY_DIED, res.entityInfo);
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

        this.eventBus.on(EventBusMessage.ENTITY_SYNC, (entityInfo:EntityInfo)=>{
            this.serverSocket.emit(ServerToSocketMsg.ENTITY_SYNC, entityInfo);
        })
    }
}
