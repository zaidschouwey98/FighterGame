import { Socket } from "socket.io";
import { AttackDataBase, MeleeAttackData, ProjectileAttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";
import { PlayerState } from "../../shared/PlayerState";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { HitboxValidationService } from "../HitboxValidationService";
import { ServerState } from "../ServerState";
import { Projectile } from "../../shared/player/weapons/projectiles/Projectile";
import { ServerProjectileCollisionHandler } from "../collisions/ServerProjectileCollisionHandler";

export interface AttackHandler {
    handle(data: AttackDataBase, serverState: ServerState, socket?: Socket): void;
}

export class MeleeAttackHandler implements AttackHandler {
    constructor(
        private serverState:ServerState,
        private eventBus: EventBus
    ){}

    handle(data: MeleeAttackData, serverState: ServerState, socket?:Socket): void {
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
            if (!player) return;
            player.isDead = true;
            player.state = PlayerState.DEAD;
            this.eventBus.emit(EventBusMessage.ENTITY_DIED, { playerInfo:this.serverState.getPlayer(player.id).toInfo(), socket:socket, killerId:attacker.id });
        }
        
    }
}

export class ProjectileAttackHandler implements AttackHandler {
    handle(data: ProjectileAttackData, serverState: ServerState, socket?:Socket): void {
        let dx = Math.cos(data.rotation);
        let dy = Math.sin(data.rotation);
        let proj = new Projectile(data.position, {dx:dx, dy:dy}, data.playerId, 20, 20, new ServerProjectileCollisionHandler())
        serverState.addEntity(proj, socket);
    }
}
