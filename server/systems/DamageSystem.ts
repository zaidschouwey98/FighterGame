import { AttackReceivedData, AttackResult, KnockbackData } from "../../shared/AttackResult";
import { EntityState } from "../../shared/PlayerState";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { ServerState } from "../ServerState";

export class DamageSystem {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus
    ) { }

    applyDamage(targetId: string, damage: number, attackerId: string, knockback?: { dx: number, dy: number }, knockbackTimer: number = 20) {
        const target = this.serverState.getEntity(targetId);
        const attacker = this.serverState.getEntity(attackerId);
        if (!target) return;

        if (target.state === EntityState.BLOCKING) {
            this.eventBus.emit(EventBusMessage.ENTITY_RECEIVED_KNOCKBACK, {
                knockbackData: {
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
        this.eventBus.emit(EventBusMessage.ATTACK_RESULT, {
            attackResult: {
                targetId: targetId,
                dmg: finalDmg,
                isCrit: isCrit

            } as AttackResult,
            entityId: attackerId
        });
        if (target.hp <= 0 && !target.isDead) {
            target.isDead = true;
            target.state = EntityState.DEAD;
            this.eventBus.emit(EventBusMessage.ENTITY_DIED, {
                entityInfo: target.toInfo(),
                killerId: attackerId
            });
            this.serverState.removeEntity(targetId);
        } else {
            this.eventBus.emit(EventBusMessage.ATTACK_RECEIVED, {
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
