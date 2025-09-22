import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import { AttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import { PlayerState } from "../../shared/PlayerState";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import PlayerInfo from "../../shared/PlayerInfo";
import { HitboxValidationService } from "../HitboxValidationService";

export class AttackSystem {
    constructor(private io: Server, private serverState: ServerState) { }

    handleAttack(data: AttackData) {
        const attacker = this.serverState.getPlayer(data.playerId);
        if (!attacker) return;

        attacker.position = data.position;
        attacker.state = data.playerAction;

        const hitPlayerIds = HitboxValidationService.getTargetsInHitbox(
            data.hitbox,
            this.serverState.getPlayers(),
            data.playerId
        );

        const attackResults: PlayerInfo[] = [];
        let blockedBy: PlayerInfo | undefined;
        let killNumber = 0;
        const killedPlayers: PlayerInfo[] = [];

        for (const targetId of hitPlayerIds) {
            const target = this.serverState.getPlayer(targetId);
            if (!target) continue;

            const damage = 20; // TODO balance
            if (target.state !== PlayerState.BLOCKING) {
                target.hp -= damage;
            } else {
                blockedBy = target;
            }

            attackResults.push(target);

            if (target.hp <= 0 && !target.isDead) {
                attacker.hp += 20;
                killNumber++;
                killedPlayers.push(target);
            }
        }

        // 🔥 ATTENTION : résultat autoritaire → tout le monde doit le recevoir
        this.io.emit(ServerToSocketMsg.ATTACK_RESULT, {
            attackerId: data.playerId,
            hitPlayers: attackResults,
            knockbackStrength: data.knockbackStrength,
            blockedBy,
            killNumber,
            knockbackTimer: 40,
        } as AttackResult);

        for (const player of killedPlayers) {
            this.handlePlayerDeath(player.id);
        }
    }

    public handleStartAttack(socket:Socket | undefined, playerInfo:PlayerInfo) {
        if (this.serverState.playerExists(playerInfo.id)) {
            this.serverState.updatePlayer(playerInfo);
            if(socket)
                socket.broadcast.emit(ServerToSocketMsg.START_ATTACK, this.serverState.getPlayer(playerInfo.id));
            else 
                this.io.emit(ServerToSocketMsg.START_ATTACK, this.serverState.getPlayer(playerInfo.id))
        }
    }

    private handlePlayerDeath(playerId: string) {
        const player = this.serverState.getPlayer(playerId);
        if (!player) return;
        player.isDead = true;

        // 🔥 Mort = info autoritaire → broadcast à tout le monde
        this.io.emit(ServerToSocketMsg.PLAYER_DIED, { id: playerId });
    }
}
