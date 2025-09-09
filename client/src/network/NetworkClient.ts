import { io, Socket } from "socket.io-client";
import { EventBusMessage, type EventBus } from "../core/EventBus";
import Player from "../core/player/Player";
import type { PlayerState } from "../../../shared/PlayerState";
import type { AttackData } from "../../../shared/AttackData";
import type { AttackResult } from "../../../shared/AttackResult";
import type PlayerInfo from "../../../shared/PlayerInfo";

export class NetworkClient {
    private socket: Socket;
    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);
        this.socket.on("connect", () => {
            console.log("Connecté au serveur", this.socket.id);
            this.eventBus.emit(EventBusMessage.CONNECTED, this.socket.id);
        });
        this.socket.on("currentPlayers", (players: PlayerInfo[]) => {
                
                this.eventBus.emit(EventBusMessage.PLAYERS_INIT, Object.values(players));
            });

        // this.socket.on("attackResult", (attackResult: AttackResult) => this.eventBus.emit("player:attackedResult", attackResult));
        this.socket.on("newPlayer", (player: PlayerInfo) => {
            this.eventBus.emit(EventBusMessage.PLAYER_JOINED, player);
        });

        this.socket.on("playerDisconnected", (playerId: string) => {
            this.eventBus.emit(EventBusMessage.PLAYER_LEFT, playerId);
        });

        // SENDING TO SOCKET
        this.eventBus.on(EventBusMessage.ATTACK_PERFORMED, (attackData) => {
            this.socket.emit("attack", attackData);
        });

        this.eventBus.on(EventBusMessage.PLAYER_UPDATED, (playerInfo) => {
            this.socket.emit("playerUpdate", playerInfo);
        });
    }

    move(position: { x: number, y: number }, action: PlayerState) {
        this.socket.emit("move", {
            x: position.x,
            y: position.y,
            action: action
        });
    }

    stopMoving(action: PlayerState) {
        this.socket.emit("stopMoving", action);
    }

    dash(position: { x: number, y: number }, action: PlayerState) {
        this.socket.emit("dash", {
            x: position.x,
            y: position.y,
            action: action
        })
    }

    block(player: Player) {
        console.debug(player)
        // console.log("blocking..")
        // this.socket.emit("block", player.currentAction);
    }

    blockEnd(player: Player) {
        console.debug(player)
        // this.socket.emit("blockEnd",player);
        // console.log("blocking ended")
    }

    attack(attackData: AttackData) {
        this.socket.emit("attack", attackData);
    }

    actionUpdated(action: PlayerState) {
        this.socket.emit("actionUpdated", action)
    }
}