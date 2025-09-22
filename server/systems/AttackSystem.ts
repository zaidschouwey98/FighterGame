import { Server, Socket } from "socket.io";
import { ServerState } from "../ServerState";
import { AttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import { PlayerState } from "../../shared/PlayerState";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import PlayerInfo from "../../shared/PlayerInfo";
import { HitboxValidationService } from "../HitboxValidationService";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";

export class AttackSystem {
    constructor(private serverState: ServerState, private eventBus:EventBus) { }

    handleAttack(data: AttackData, socket:Socket) {
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
        this.eventBus.emit(EventBusMessage.ATTACK_RESULT,{attackResult:{
            attackerId: data.playerId,
            hitPlayers: attackResults,
            knockbackStrength: data.knockbackStrength,
            blockedBy,
            killNumber,
            knockbackTimer: 40,
        } as AttackResult, socket:socket})

        for (const player of killedPlayers) {
            this.handlePlayerDeath(socket,player.id);
        }
    }

    public handleStartAttack(socket:Socket, playerInfo:PlayerInfo) {
        if (this.serverState.playerExists(playerInfo.id)) {
            this.serverState.updatePlayer(playerInfo);
            this.eventBus.emit(EventBusMessage.START_ATTACK, {playerInfo:this.serverState.getPlayer(playerInfo.id), socket:socket})
        }
    }

    private handlePlayerDeath(socket:Socket, playerId: string) {
        const player = this.serverState.getPlayer(playerId);
        if (!player) return;
        player.isDead = true;
        this.eventBus.emit(EventBusMessage.PLAYER_DIED, { playerId:playerId, socket:socket });
    }
}
