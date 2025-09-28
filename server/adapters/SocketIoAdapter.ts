import { Server, Socket } from "socket.io";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import { AttackReceivedData, AttackResult, KnockbackData } from "../../shared/types/AttackResult";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerState } from "../ServerState";
import { EntityInfo } from "../../shared/messages/EntityInfo";
import { EntityEvent, EventBus, LocalPlayerEvent } from "../../shared/services/EventBus";
import { AttackDataBase } from "../../shared/types/AttackData";
import Position from "../../shared/Position";

export class SocketIoAdapter {
    constructor(private eventBus: EventBus, private serverSocket:Server, private serverState: ServerState) {
        this.eventBus.on(EntityEvent.RECEIVE_ATTACK, (res:{attackReceivedData: AttackReceivedData,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                return;
            }
            playerSocket.emit(ServerToSocketMsg.ATTACK_RECEIVED, res.attackReceivedData);
        });

        this.eventBus.on(LocalPlayerEvent.ATTACK_RESULT, (res:{attackResult: AttackResult,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                return;
            }
            playerSocket.emit(ServerToSocketMsg.ATTACK_RESULT, res.attackResult);
        });

        this.eventBus.on(EntityEvent.KNOCKBACKED, (res:{knockbackData: KnockbackData,entityId:string}) => {
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                return;
            }
            playerSocket.emit(ServerToSocketMsg.KNOCKBACK_RECEIVED, res.knockbackData);
        });
        
        this.eventBus.on(EntityEvent.START_ATTACK, (res:{ entityId: string; attackData: AttackDataBase; })=>{
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                this.serverSocket.emit(ServerToSocketMsg.START_ATTACK, res);
                return;
            }
            playerSocket.broadcast.emit(ServerToSocketMsg.START_ATTACK, res);
        });

        this.eventBus.on(EntityEvent.DIED, (res: { entityInfo: EntityInfo; killerId?: string })=>{
            this.serverSocket.emit(ServerToSocketMsg.ENTITY_DIED, res);
        })

        this.eventBus.on(EntityEvent.ADDED, (entityInfo: EntityInfo)=>{
            const playerSocket = this.serverState.getPlayerSocket(entityInfo.id);
            // if(!playerSocket){
                this.serverSocket.emit(ServerToSocketMsg.NEW_ENTITY, entityInfo);
            //     return;
            // }
            // playerSocket.broadcast.emit(ServerToSocketMsg.NEW_ENTITY, entityInfo);
        })

        this.eventBus.on(EntityEvent.DIRECTION_CHANGED, (res:{ entityId: string; direction: { dx: number; dy: number; }; })=>{
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, res);
                return;
            }
            playerSocket.broadcast.emit(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, res);
        })

        this.eventBus.on(EntityEvent.POSITION_UPDATED, (res:{ entityId: string; position: Position; })=>{
            const playerSocket = this.serverState.getPlayerSocket(res.entityId);
            if(!playerSocket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_POS_UPDATE, res);
                return;
            }
            playerSocket.broadcast.emit(ServerToSocketMsg.ENTITY_POS_UPDATE, res);
        })

        this.eventBus.on(EntityEvent.UPDATED, (entity:EntityInfo)=>{
            const playerSocket = this.serverState.getPlayerSocket(entity.id);

            if(!playerSocket){
                this.serverSocket.emit(ServerToSocketMsg.ENTITY_UPDATE, entity);
                return;
            }
            playerSocket.broadcast.emit(ServerToSocketMsg.ENTITY_UPDATE, entity);
        })

        this.eventBus.on(EntityEvent.SYNC, (entityInfo:EntityInfo)=>{
            this.serverSocket.emit(ServerToSocketMsg.ENTITY_SYNC, entityInfo);
        })
    }
}
