import { Socket } from "socket.io";
import { AttackDataBase, MeleeAttackData, ProjectileAttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import PlayerInfo from "../../shared/PlayerInfo";
import { EntityState } from "../../shared/PlayerState";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { HitboxValidationService } from "../HitboxValidationService";
import { ServerState } from "../ServerState";
import { Projectile } from "../../shared/player/weapons/projectiles/Projectile";
import { ServerProjectileCollisionHandler } from "../collisions/ServerProjectileCollisionHandler";
import { PhysicsService } from "../../shared/services/PhysicsService";

export interface AttackHandler {
    handle(data: AttackDataBase, socket?: Socket): void;
}

export class MeleeAttackHandler implements AttackHandler {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus
    ) { }

    handle(data: MeleeAttackData, socket?: Socket): void {
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
            if (target.state !== EntityState.BLOCKING) {
                target.hp -= damage;
            } else {
                blockedBy = target.toInfo();
            }

            attackResults.push(target.toInfo());

            if (target.hp <= 0 && !target.isDead) {
                killNumber++;
                killedPlayers.push(target.toInfo());
            }
            if(target.hp < 0)
                continue;
            this.eventBus.emit(EventBusMessage.ATTACK_RECEIVED, {
                attackResult: {
                    newHp: target.hp,
                    knockBackVector: PhysicsService.computeKnockback(attacker.position,target.position, data.knockbackStrength),
                    knockbackTimer: 40,
                } as AttackResult, socket: this.serverState.getPlayerSocket(target.id)
            })
        }
    }
}

export class ProjectileAttackHandler implements AttackHandler {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus
    ) { }
    handle(data: ProjectileAttackData, socket?: Socket): void {
        let dx = Math.cos(data.rotation);
        let dy = Math.sin(data.rotation);
        let proj = new Projectile(data.position, 40, { dx: dx, dy: dy }, data.playerId, 20, 20, new ServerProjectileCollisionHandler(this.eventBus, this.serverState))
        this.serverState.addEntity(proj, socket);
    }
}
