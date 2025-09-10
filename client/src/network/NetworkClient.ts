import { io, Socket } from "socket.io-client";
import { EventBusMessage, type EventBus } from "../core/EventBus";
import type PlayerInfo from "../../../shared/PlayerInfo";
import type { AttackResult } from "../../../shared/AttackResult";
import type { AttackData } from "../../../shared/AttackData";
import { ServerToSocketMsg } from "../../../shared/ServerToSocketMsg";
import { ClientToSocketMsg } from "../../../shared/ClientToSocketMsg";

export class NetworkClient {
    private socket: Socket;
    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);
        this.socket.on(ServerToSocketMsg.CONNECTED, () => {
            console.log("Connecté au serveur", this.socket.id);
            this.eventBus.emit(EventBusMessage.CONNECTED, this.socket.id);
        });
        this.socket.on(ServerToSocketMsg.CURRENT_PLAYERS, (players: PlayerInfo[]) => {
            this.eventBus.emit(EventBusMessage.PLAYERS_INIT, Object.values(players));
        });

        this.socket.on(ServerToSocketMsg.NEW_PLAYER, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_JOINED, player);
        });

        this.socket.on(ServerToSocketMsg.PLAYER_UPDATE, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player);
        });

        this.socket.on(ServerToSocketMsg.DISCONNECT, (playerId: string) => {
            this.eventBus.emit(EventBusMessage.PLAYER_LEFT, playerId);
        });

        this.socket.on(ServerToSocketMsg.ATTACK_RESULT, (attackResult: AttackResult) => {
            this.eventBus.emit(EventBusMessage.ATTACK_RESULT, attackResult);
        })

        this.socket.on(ServerToSocketMsg.PLAYER_DIED, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_DIED, player);
        });

        this.socket.on(ServerToSocketMsg.PLAYER_RESPAWNED, (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_RESPAWNED, player);
        });

        // SENDING TO SOCKET    
        this.eventBus.on(EventBusMessage.LOCAL_ATTACK_PERFORMED, (attackData: AttackData) => {
            this.socket.emit(ClientToSocketMsg.ATTACK, attackData);
        });

        this.eventBus.on(EventBusMessage.LOCAL_PLAYER_UPDATED, (playerInfo) => {
            // TODO SHOULD SEPARATE EVENTS
            this.socket.emit(ClientToSocketMsg.PLAYER_UPDATE, playerInfo);
            this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, playerInfo);
        });
    }

    public spawnPlayer(name: string) {
        this.socket.emit(ClientToSocketMsg.SPAWN_PLAYER, name);
    }

    respawnPlayer() {
        this.socket.emit(ClientToSocketMsg.RESPAWN_PLAYER);
    }
}