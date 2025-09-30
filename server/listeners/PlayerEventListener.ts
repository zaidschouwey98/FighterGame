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
import { Direction } from "../../shared/enums/Direction";
import { EntityCommand, EventBus } from "../../shared/services/EventBus";

export class HumanEventListener {
    constructor(
        private socket: Socket,
        private eventBus: EventBus,
        private serverState: ServerState
    ) {
        socket.emit(ServerToSocketMsg.CONNECTED, socket.id);
        socket.emit(ServerToSocketMsg.CURRENT_ENTITIES, this.serverState.getPlayersAsInfo());
    }

    register() {
        this.socket.on(EntityCommand.ATTACK, (res:{ entityId: string; attackData: AttackDataBase; }) =>
            this.eventBus.emit(EntityCommand.ATTACK, res)
        );

        this.socket.on(EntityCommand.UPDATED, (playerInfo: PlayerInfo) =>
            this.eventBus.emit(EntityCommand.UPDATED, playerInfo)
        );

        this.socket.on(EntityCommand.POSITION_UPDATED, (res:{ entityId: string; position: Position }) => {
            this.eventBus.emit(EntityCommand.POSITION_UPDATED, res);
        })

        this.socket.on(EntityCommand.MOVING_VECTOR_CHANGED, (res: { entityId: string; movingVector: { dx: number; dy: number; }, state: EntityState, movingDirection: Direction}) =>
            this.eventBus.emit(EntityCommand.MOVING_VECTOR_CHANGED, res)
        );

        this.socket.on(ClientToSocketMsg.SPAWN_PLAYER, (name: string) => {
            const player = new Player(this.socket.id, name?.trim(),{x:0,y:0}, 100, 10, new ServerPlayerCollisionHandler());
            this.serverState.addPlayer(player,this.socket);
            console.log(`Spawn player ${player.playerName} (${this.socket.id})`);
        });
        // this.socket.on(ClientToSocketMsg.RESPAWN_PLAYER, (name: string) => {
        //     const player = this.serverState.getEntity(this.socket.id);
        //     if (!player) return;

        //     player.hp = 100;
        //     player.isDead = false;
        //     player.position = { x: 0, y: 0 };
        //     player.state = EntityState.IDLE;
        //     this.socket.emit(ServerToSocketMsg.ENTITY_RESPAWNED, player.toInfo());
        //     this.socket.broadcast.emit(ServerToSocketMsg.ENTITY_RESPAWNED, player.toInfo());
        // });
    }
}
