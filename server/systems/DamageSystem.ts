import { AttackReceivedData, AttackResult, KnockbackData } from "../../shared/types/AttackResult";
import { EntityState } from "../../shared/messages/EntityState";
import { ServerState } from "../ServerState";
import { EntityEvent, EventBus, LocalPlayerEvent } from "../../shared/services/EventBus";
import { EntityType } from "../../shared/enums/EntityType";
import { LivingEntity } from "../../shared/entities/LivingEntity";

export class DamageSystem {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus
    ) { }

    applyDamage(targetId: string, damage: number, attackerId: string, knockback?: { dx: number, dy: number }, knockbackTimer: number = 20) {
        const target = this.serverState.getEntity(targetId) as LivingEntity;
        const attacker = this.serverState.getEntity(attackerId) as LivingEntity;
        if (!target || target.entityType != EntityType.PLAYER) return;

        if (target.state === EntityState.BLOCKING) {
            this.eventBus.emit(EntityEvent.KNOCKBACKED, {
                knockbackData: {
                    id: targetId,
                    knockbackVector: { dx: knockback!.dx * -1, dy: knockback!.dy * -1 },
                    knockbackTimer: knockbackTimer
                } as KnockbackData,
                entityId: attackerId
            })
            return;
        }
        damage = Math.round(damage * (Math.random() + 0.5));
        const isCrit = Math.random() < attacker.critChance;
        const finalDmg = isCrit ? damage * 2 : damage;
        target.hp -= finalDmg;
        this.eventBus.emit(LocalPlayerEvent.ATTACK_RESULT, {
            attackResult: {
                targetId: targetId,
                dmg: finalDmg,
                isCrit: isCrit,
                id: attackerId
            } as AttackResult,
            entityId: attackerId
        });
        if (target.hp <= 0 && !target.isDead) {
            target.isDead = true;
            target.state = EntityState.DEAD;
            this.eventBus.emit(EntityEvent.DIED, {
                entityInfo: target.toInfo(),
                killerId: attackerId
            });
            this.serverState.removeEntity(targetId);
        } else {
            this.eventBus.emit(EntityEvent.RECEIVE_ATTACK, {
                attackReceivedData: {
                    newHp: target.hp,
                    knockbackData: {
                        knockbackVector: knockback,
                        knockbackTimer: knockbackTimer
                    }
                } as AttackReceivedData,
                entityId: target.id
            });

        }
    }
}
