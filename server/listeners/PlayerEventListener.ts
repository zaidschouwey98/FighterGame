import { Socket } from "socket.io";
import { AttackSystem } from "../systems/AttackSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { ClientToSocketMsg } from "../../shared/ClientToSocketMsg";
import { AttackData } from "../../shared/AttackData";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { ServerState } from "../ServerState";
import { PlayerState } from "../../shared/PlayerState";
import { Direction } from "../../shared/Direction";
import { WeaponType } from "../../shared/WeaponType";
import { UpdateSystem } from "../systems/UpdateSystem";

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
        socket.emit(ServerToSocketMsg.CURRENT_PLAYERS, this.serverState.getPlayers());
    }

    register() {
        this.socket.on(ClientToSocketMsg.ATTACK, (data: AttackData) =>
            this.attackSystem.handleAttack(data,this.socket)
        );

        this.socket.on(ClientToSocketMsg.PLAYER_UPDATE, (playerInfo: PlayerInfo) =>
            this.updateSystem.handlePlayerUpdated(this.socket, playerInfo)
        );

        this.socket.on(ClientToSocketMsg.PLAYER_POS_UPDATE, (playerInfo: PlayerInfo) => {
            this.movementSystem.handlePosUpdated(this.socket, playerInfo);
        })

        this.socket.on(ClientToSocketMsg.START_ATTACK, (playerInfo: PlayerInfo) => {
            this.attackSystem.handleStartAttack(this.socket, playerInfo);
        })
        this.socket.on(
            ClientToSocketMsg.PLAYER_DIRECTION_UPDATED,
            (playerInfo: PlayerInfo) =>
                this.directionSystem.handleDirectionUpdate(this.socket, playerInfo)
        );

        this.socket.on(ClientToSocketMsg.SPAWN_PLAYER, (name: string) => {
            const player: PlayerInfo = {
                id: this.socket.id,
                name: name?.trim(),
                position: { x: 0, y: 0 },
                hp: 100,
                speed: 10,
                mouseDirection: { x: 0, y: 0 },
                state: PlayerState.IDLE,
                movingDirection: Direction.BOTTOM,
                attackIndex: 0,
                attackDashMaxSpeed: 3,
                isDead: false,
                killCounter: 0,
                killStreak: 0,
                movingVector: { dx: 0, dy: 0 },
                weapon: WeaponType.HEAVY_SWORD
            };
            this.serverState.addPlayer(player);
            console.log(`Spawn player ${player.name} (${this.socket.id})`);
            this.socket.emit(ServerToSocketMsg.NEW_PLAYER, player);
            this.socket.broadcast.emit(ServerToSocketMsg.NEW_PLAYER, player);
        });
        this.socket.on(ClientToSocketMsg.RESPAWN_PLAYER, () => {
            const player = this.serverState.getPlayer(this.socket.id);
            if (!player) return;

            player.hp = 100;
            player.isDead = false;
            player.position = { x: 0, y: 0 };
            player.state = PlayerState.IDLE;

            this.socket.emit(ServerToSocketMsg.PLAYER_RESPAWNED, player);
            this.socket.broadcast.emit(ServerToSocketMsg.PLAYER_RESPAWNED, player);

        });
    }
}
