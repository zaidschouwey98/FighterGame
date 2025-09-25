import { Socket } from "socket.io";
import { AttackSystem } from "../systems/AttackSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { ClientToSocketMsg } from "../../shared/ClientToSocketMsg";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { ServerState } from "../ServerState";
import { EntityState } from "../../shared/PlayerState";
import { Direction } from "../../shared/Direction";
import { WeaponType } from "../../shared/WeaponType";
import { UpdateSystem } from "../systems/UpdateSystem";
import { EntityType } from "../../shared/EntityType";
import { Player } from "../../shared/player/Player";
import { ServerPlayerCollisionHandler } from "../collisions/ServerPlayerCollisionHandler";
import { AttackDataBase } from "../../shared/AttackData";

export class HumanEventListener {
    constructor(
        private socket: Socket,
        private attackSystem: AttackSystem,
        private movementSystem: MovementSystem,
        private directionSystem: DirectionSystem,
        private updateSystem: UpdateSystem,
        private serverState: ServerState
    ) {
        socket.emit(ServerToSocketMsg.CONNECTED, socket.id);
        socket.emit(ServerToSocketMsg.CURRENT_ENTITIES, this.serverState.getPlayersAsInfo());
    }

    register() {
        this.socket.on(ClientToSocketMsg.ATTACK, (data: AttackDataBase) =>
            this.attackSystem.handleAttack(data,this.socket)
        );

        this.socket.on(ClientToSocketMsg.PLAYER_UPDATE, (playerInfo: PlayerInfo) =>
            this.updateSystem.handlePlayerUpdated(playerInfo, this.socket)
        );

        this.socket.on(ClientToSocketMsg.PLAYER_POS_UPDATE, (playerInfo: PlayerInfo) => {
            this.movementSystem.handlePosUpdated(playerInfo, this.socket);
        })

        this.socket.on(ClientToSocketMsg.START_ATTACK, (playerInfo: PlayerInfo) => {
            this.attackSystem.handleStartAttack(playerInfo, this.socket);
        })
        this.socket.on(
            ClientToSocketMsg.PLAYER_DIRECTION_UPDATED,
            (playerInfo: PlayerInfo) =>
                this.directionSystem.handleDirectionUpdate(playerInfo, this.socket)
        );

        this.socket.on(ClientToSocketMsg.SPAWN_PLAYER, (name: string) => {
            const player = new Player(this.socket.id, name?.trim(),{x:0,y:0}, 100, 10, new ServerPlayerCollisionHandler());
            this.serverState.addPlayer(player,this.socket);
            console.log(`Spawn player ${player.playerName} (${this.socket.id})`);
        });
        this.socket.on(ClientToSocketMsg.RESPAWN_PLAYER, (name: string) => {
            const player = this.serverState.getEntity(this.socket.id);
            if (!player) return;

            player.hp = 100;
            player.isDead = false;
            player.position = { x: 0, y: 0 };
            player.state = EntityState.IDLE;
            this.socket.emit(ServerToSocketMsg.ENTITY_RESPAWNED, player.toInfo());
            this.socket.broadcast.emit(ServerToSocketMsg.ENTITY_RESPAWNED, player.toInfo());
        });
    }
}
