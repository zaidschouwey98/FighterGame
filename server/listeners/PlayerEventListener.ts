import { Socket } from "socket.io";
import { AttackSystem } from "../systems/AttackSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { ClientToSocketMsg } from "../../shared/enums/ClientToSocketMsg";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/enums/ServerToSocketMsg";
import { ServerState } from "../ServerState";
import { EntityState } from "../../shared/messages/EntityState";
import { UpdateSystem } from "../systems/UpdateSystem";
import { Player } from "../../shared/entities/Player";
import { ServerPlayerCollisionHandler } from "../collisions/ServerPlayerCollisionHandler";
import { AttackDataBase } from "../../shared/types/AttackData";
import Position from "../../shared/Position";

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

        this.socket.on(ClientToSocketMsg.PLAYER_POS_UPDATE, (res:{ entityId: string; position: Position }) => {
            this.movementSystem.handlePosUpdated(res.entityId, res.position, this.socket);
        })

        this.socket.on(ClientToSocketMsg.START_ATTACK, (res:{ entityId: string; attackData: AttackDataBase; }) => {
            // this.attackSystem.handleStartAttack(res., this.socket);
        })
        this.socket.on(
            ClientToSocketMsg.PLAYER_DIRECTION_UPDATED,
            (res: { entityId: string; direction: { dx: number; dy: number; }}) =>
                this.directionSystem.handleDirectionUpdate(res.entityId, res.direction, this.socket)
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
