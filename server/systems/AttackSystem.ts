import { Socket } from "socket.io";
import { ServerState } from "../ServerState";
import { AttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import { PlayerState } from "../../shared/PlayerState";
import PlayerInfo from "../../shared/PlayerInfo";
import { HitboxValidationService } from "../HitboxValidationService";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";

export class AttackSystem {
    constructor(private serverState: ServerState, private eventBus:EventBus) { }

    handleAttack(data: AttackData, socket?:Socket) {
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
                blockedBy = target.toInfo();
            }

            attackResults.push(target.toInfo());

            if (target.hp <= 0 && !target.isDead) {
                killNumber++;
                killedPlayers.push(target.toInfo());
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
            this.handlePlayerDeath(player, attacker.id, socket);
        }
    }

    public handleStartAttack(playerInfo:PlayerInfo, socket?:Socket) {
        if (this.serverState.playerExists(playerInfo.id)) {
            this.serverState.updatePlayer(playerInfo);
            this.eventBus.emit(EventBusMessage.START_ATTACK, {playerInfo:this.serverState.getPlayer(playerInfo.id).toInfo(), socket:socket})
        }
    }

    private handlePlayerDeath( playerInfo:PlayerInfo, killerId:string, socket?:Socket) {
        const player = this.serverState.getPlayer(playerInfo.id);
        if (!player) return;
        player.isDead = true;
        player.state = PlayerState.DEAD;
        this.eventBus.emit(EventBusMessage.PLAYER_DIED, { playerInfo:this.serverState.getPlayer(playerInfo.id).toInfo(), socket:socket, killerId:killerId });
    }
}
