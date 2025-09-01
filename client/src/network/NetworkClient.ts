import { io, Socket } from "socket.io-client";
import type { EventBus } from "../core/Eventbus";
import type Player from "../Player";


export class NetworkClient {
    private socket: Socket;

    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => console.log("Connecté au serveur", this.socket.id));
        this.socket.on("players", (players: Player[]) => this.eventBus.emit("players:update", players));
        this.socket.on("playerMoved", (player: Player) => this.eventBus.emit("player:moved", player));
    }

    move(position: { x: number, y: number }) {
        this.socket.emit("move", position);
    }
}
