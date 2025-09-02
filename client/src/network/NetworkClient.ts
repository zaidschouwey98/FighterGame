import { io, Socket } from "socket.io-client";
import type { EventBus } from "../core/EventBus";
import type Player from "../../../shared/Player";
import type { Action } from "../../../shared/Action";
import type { AttackData } from "../../../shared/AttackData";

export class NetworkClient {
    private socket: Socket;
    public playerId: string | undefined = undefined;

    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            console.log("Connecté au serveur", this.socket.id);
            this.playerId = this.socket.id;
            this.eventBus.emit("connected", this.socket.id);
        });
        this.socket.on("attackResult", (player:Player)=> this.eventBus.emit("player:attackedResult", player));
        this.socket.on("playerAttacks", (player:Player)=> this.eventBus.emit("player:attacks", player));
        this.socket.on("players", (players: Player[]) => this.eventBus.emit("players:update", players));
        this.socket.on("playerMoved", (player: Player) => this.eventBus.emit("player:moved", player));
        this.socket.on("currentPlayers", (players: Record<string, Player>) => {
            const playersArray = Object.values(players);
            this.eventBus.emit("players:update", playersArray);
        });
        this.socket.on("newPlayer", (player: Player) => {
            this.eventBus.emit("player:joined", player);
        });
        this.socket.on("playerDisconnected", (playerId: string) => {
            this.eventBus.emit("player:left", playerId);
        });
    }

    move(position: { x: number, y: number }, action: Action) {
        this.socket.emit("move", {
            x: position.x,
            y: position.y,
            action: action
        });
    }

    attack(attackData:AttackData){
        this.socket.emit("attack",attackData);
    }

    getPlayerId(): string | undefined {
        return this.playerId;
    }
}