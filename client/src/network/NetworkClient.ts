import { io, Socket } from "socket.io-client";
import type PlayerInfo from "../../../shared/messages/PlayerInfo";
import type { AttackReceivedData, AttackResult, KnockbackData } from "../../../shared/types/AttackResult";
import { ServerToSocketMsg } from "../../../shared/enums/ServerToSocketMsg";
import { ClientToSocketMsg } from "../../../shared/enums/ClientToSocketMsg";
import { EntityCommand, EntityEvent, LocalPlayerEvent, NetworkEvent, type EventBus } from "../../../shared/services/EventBus";
import type { EntityInfo } from "../../../shared/messages/EntityInfo";
import type { AttackDataBase } from "../../../shared/types/AttackData";
import type Position from "../../../shared/Position";
import { GameState } from "../core/GameState";
import type { EntityState } from "../../../shared/messages/EntityState";
import type { Direction } from "../../../shared/enums/Direction";

export class NetworkClient {
    private socket: Socket;
    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);
        this.socket.on(ServerToSocketMsg.CONNECTED, () => {
            console.log("Connecté au serveur", this.socket.id);
            this.eventBus.emit(NetworkEvent.CONNECTED, this.socket.id!);
        });
        this.socket.on(ServerToSocketMsg.CURRENT_ENTITIES, (players: PlayerInfo[]) => {
            this.eventBus.emit(NetworkEvent.ENTITIES_INIT, Object.values(players));
        });

        this.socket.on(ServerToSocketMsg.NEW_ENTITY, (entity: EntityInfo) => {
            this.eventBus.emit(EntityEvent.ADDED, entity);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_UPDATE, (entity: EntityInfo) => {
            this.eventBus.emit(EntityEvent.UPDATED, entity);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, (res: { entityId: string; direction: { dx: number; dy: number; } }) => {
            let p = GameState.instance.getEntity(res.entityId); // todo optimize
            if (!p) return;
            p!.movingVector = res.direction
            this.eventBus.emit(EntityEvent.UPDATED, p);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_POS_UPDATE, (res: { entityId: string; position: Position; }) => {
            this.eventBus.emit(EntityEvent.POSITION_UPDATED, res);
        });

        this.socket.on(ServerToSocketMsg.DISCONNECT, (playerId: string) => {
            this.eventBus.emit(LocalPlayerEvent.LEFT, playerId);
        });

        this.socket.on(ServerToSocketMsg.ATTACK_RECEIVED, (res:{attackReceivedData: AttackReceivedData,entityId:string}) => {
            this.eventBus.emit(EntityEvent.RECEIVE_ATTACK, res);
        })

        this.socket.on(ServerToSocketMsg.ATTACK_RESULT, (res:{attackResult: AttackResult,entityId:string}) => {
            this.eventBus.emit(LocalPlayerEvent.ATTACK_RESULT, res);
        })

        this.socket.on(ServerToSocketMsg.KNOCKBACK_RECEIVED, (res:{knockbackData: KnockbackData,entityId:string}) => {
            this.eventBus.emit(EntityEvent.KNOCKBACKED, res);
        })

        this.socket.on(ServerToSocketMsg.ENTITY_DIED, (res: { entityInfo: EntityInfo, killerId: string }) => {
            this.eventBus.emit(EntityEvent.DIED, res);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_SYNC, (entity: EntityInfo) => {
            this.eventBus.emit(EntityEvent.SYNC, entity);
        });


        // SENDING TO SOCKET    
        this.eventBus.on(EntityCommand.ATTACK, (res: { entityId: string, attackData: AttackDataBase }) => {
            this.socket.emit(EntityCommand.ATTACK, res);
        });

        this.eventBus.on(EntityCommand.UPDATED, (playerInfo) => {
            // TODO SHOULD SEPARATE EVENTS
            this.socket.emit(EntityCommand.UPDATED, playerInfo);
            this.eventBus.emit(EntityEvent.UPDATED, playerInfo);
        });

        this.eventBus.on(EntityCommand.MOVING_VECTOR_CHANGED, (res: { entityId: string, movingVector: { dx: number, dy: number }, state: EntityState, movingDirection: Direction }) => {
            this.socket.emit(EntityCommand.MOVING_VECTOR_CHANGED, res);
        });

        this.eventBus.on(EntityCommand.POSITION_UPDATED, (res: { entityId: string; position: Position }) => {
            this.socket.emit(EntityCommand.POSITION_UPDATED, res);
            this.eventBus.emit(EntityEvent.POSITION_UPDATED, res);
        })

        this.eventBus.on(EntityCommand.STATE_CHANGED, (data: { entityId: string; state: EntityState; })=>{
            this.socket.emit(EntityCommand.STATE_CHANGED, data);
        })
    }

    public spawnPlayer(name: string) {
        this.socket.emit(ClientToSocketMsg.SPAWN_PLAYER, name);
    }

    respawnPlayer() {
        this.socket.emit(ClientToSocketMsg.RESPAWN_PLAYER);
    }
}