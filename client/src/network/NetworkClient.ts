import { io, Socket } from "socket.io-client";
import type { EventBus } from "../core/EventBus";
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
            this.eventBus.emit("connected", this.socket.id);
        });
        this.socket.on("currentPlayers", (players: PlayerInfo[]) => {
                
                this.eventBus.emit("players:init", Object.values(players));
            });

        this.socket.on("attackResult", (attackResult: AttackResult) => this.eventBus.emit("player:attackedResult", attackResult));
        this.socket.on("newPlayer", (player: PlayerInfo) => {
            this.eventBus.emit("player:joined", player);
        });

        this.socket.on("playerDisconnected", (playerId: string) => {
            this.eventBus.emit("player:left", playerId);
        });

        // SENDING TO SOCKET
        this.eventBus.on("attack:performed", (attackData) => {
            this.socket.emit("attack", attackData);
        });

        this.eventBus.on("player:updated", (playerInfo) => {
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