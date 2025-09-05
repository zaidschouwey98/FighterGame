import { io, Socket } from "socket.io-client";
import type { EventBus } from "../core/EventBus";
import type Player from "../../../shared/Player";
import type { Action } from "../../../shared/Action";
import type { AttackData } from "../../../shared/AttackData";
import type { AttackResult } from "../../../shared/AttackResult";
import { LocalPlayer } from "../core/LocalPlayer";
import { GameState } from "../core/GameState";

export class NetworkClient {
    private socket: Socket;
    public playerId: string | undefined = undefined;
    public player: LocalPlayer | undefined;
    constructor(serverUrl: string, private eventBus: EventBus) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            console.log("Connecté au serveur", this.socket.id);
            this.playerId = this.socket.id;
            this.eventBus.emit("connected", this.socket.id);
        });
        // TODO CHANGE PLAYER TO PLAYERINFO
        this.socket.on("localPlayer",(player:Player)=>{
            this.player = new LocalPlayer(player.position,player.hp,player.speed,this.socket.id!);
            this.player.networkClient = this;
            GameState.instance.setLocalPlayer(this.player)
        });
        this.socket.on("currentPlayers", (players: Record<string, Player>) => {
            const playersArray = Object.values(players);
            this.eventBus.emit("players:update", {playerArray: playersArray,localPlayer:this.player});
        });


        this.socket.on("attackResult", (attackResult:AttackResult)=> this.eventBus.emit("player:attackedResult", attackResult));
        this.socket.on("playerDashed", (player:Player)=> this.eventBus.emit("player:dashed", player));
        this.socket.on("playerAttacks", (player:Player)=> this.eventBus.emit("player:attacks", player));
        this.socket.on("players", (players: Player[]) => this.eventBus.emit("players:update", players));
        this.socket.on("playerMoved", (player: Player) => this.eventBus.emit("player:moved", player));
        this.socket.on("playerStoppedMoving", (player: Player) => this.eventBus.emit("player:stopMoving", player));

        this.socket.on("actionUpdated", (player: Player) => this.eventBus.emit("player:actionUpdated", player));

        this.socket.on("playerIsBlocking", (player:Player)=> this.eventBus.emit("player:isBlocking", player));
        this.socket.on("playerBlockingEnded", (player:Player)=> this.eventBus.emit("player:blockingEnded", player));
        this.socket.on("newPlayer", (player: Player) => {
            this.eventBus.emit("player:joined", player);
        });

        
        this.socket.on("playerDied", (player: Player) => {
            this.eventBus.emit("player:died", player);
        });
        this.socket.on("playerRespawned", (player: Player) => {
            this.eventBus.emit("player:respawn", player);
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

    stopMoving(action:Action){
        this.socket.emit("stopMoving", action);
    }

    dash(position: { x: number, y: number }, action:Action){
        this.socket.emit("dash",{
            x: position.x,
            y: position.y,
            action: action
        })
    }

    block(player:Player){
        console.debug(player)
        // console.log("blocking..")
        // this.socket.emit("block", player.currentAction);
    }

    blockEnd(player:Player){
        console.debug(player)
        // this.socket.emit("blockEnd",player);
        // console.log("blocking ended")
    }

    attack(attackData:AttackData){
        this.socket.emit("attack",attackData);
    }

    actionUpdated(action:Action){
        this.socket.emit("actionUpdated", action)
    }
}