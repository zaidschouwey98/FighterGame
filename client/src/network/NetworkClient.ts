import { io, Socket } from "socket.io-client";
import { EventBusMessage, type EventBus } from "../../../shared/services/EventBus";
import type PlayerInfo from "../../../shared/messages/PlayerInfo";
import type { AttackReceivedData, AttackResult, KnockbackData } from "../../../shared/types/AttackResult";
import type { AttackDataBase } from "../../../shared/AttackData";
import { ServerToSocketMsg } from "../../../shared/enums/ServerToSocketMsg";
import { ClientToSocketMsg } from "../../../shared/enums/ClientToSocketMsg";
import type { EntityInfo } from "../../../shared/EntityInfo";

export class NetworkClient {
    private socket: Socket;
    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);
        this.socket.on(ServerToSocketMsg.CONNECTED, () => {
            console.log("Connecté au serveur", this.socket.id);
            this.eventBus.emit(EventBusMessage.CONNECTED, this.socket.id);
        });
        this.socket.on(ServerToSocketMsg.CURRENT_ENTITIES, (players: PlayerInfo[]) => {
            this.eventBus.emit(EventBusMessage.ENTITIES_INIT, Object.values(players));
        });

        this.socket.on(ServerToSocketMsg.NEW_ENTITY, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_ADDED, player);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_UPDATE, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_UPDATED, player);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_DIRECTION_UPDATE, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_UPDATED, player);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_POS_UPDATE, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_POSITION_UPDATED, player);
        });

        this.socket.on(ServerToSocketMsg.DISCONNECT, (playerId: string) => {
            this.eventBus.emit(EventBusMessage.PLAYER_LEFT, playerId);
        });

        this.socket.on(ServerToSocketMsg.ATTACK_RECEIVED, (attackReceivedData: AttackReceivedData) => {
            this.eventBus.emit(EventBusMessage.ATTACK_RECEIVED, attackReceivedData);
        })

        this.socket.on(ServerToSocketMsg.ATTACK_RESULT, (attackResult: AttackResult) => {
            this.eventBus.emit(EventBusMessage.ATTACK_RESULT, attackResult);
        })

        this.socket.on(ServerToSocketMsg.KNOCKBACK_RECEIVED, (knockbackData: KnockbackData) => {
            this.eventBus.emit(EventBusMessage.ENTITY_RECEIVED_KNOCKBACK, knockbackData);
        })

        this.socket.on(ServerToSocketMsg.ENTITY_DIED, (player: EntityInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_DIED, player);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_SYNC, (entity: EntityInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_SYNC, entity);
        });

        this.socket.on(ServerToSocketMsg.ENTITY_RESPAWNED, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_RESPAWNED, player);
        });

        // SENDING TO SOCKET    
        this.eventBus.on(EventBusMessage.LOCAL_ATTACK_PERFORMED, (attackData: AttackDataBase) => {
            this.socket.emit(ClientToSocketMsg.ATTACK, attackData);
        });

        this.eventBus.on(EventBusMessage.LOCAL_PLAYER_UPDATED, (playerInfo) => {
            // TODO SHOULD SEPARATE EVENTS
            this.socket.emit(ClientToSocketMsg.PLAYER_UPDATE, playerInfo);
            this.eventBus.emit(EventBusMessage.ENTITY_UPDATED, playerInfo);
        });

        this.eventBus.on(EventBusMessage.LOCAL_PLAYER_MOVING, (playerInfo) => {
            this.eventBus.emit(EventBusMessage.ENTITY_UPDATED, playerInfo);
        });

        this.eventBus.on(EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED, (playerInfo:PlayerInfo) => {
            this.socket.emit(ClientToSocketMsg.PLAYER_DIRECTION_UPDATED, playerInfo);
        });

        this.eventBus.on(EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED, (playerInfo)=>{
            this.socket.emit(ClientToSocketMsg.PLAYER_POS_UPDATE, playerInfo);
            this.eventBus.emit(EventBusMessage.ENTITY_POSITION_UPDATED, playerInfo);
        })
    }

    public spawnPlayer(name: string) {
        this.socket.emit(ClientToSocketMsg.SPAWN_PLAYER, name);
    }

    respawnPlayer() {
        this.socket.emit(ClientToSocketMsg.RESPAWN_PLAYER);
    }
}