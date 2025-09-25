import { AttackResult } from "../../shared/AttackResult";
import { EntityState } from "../../shared/PlayerState";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { ServerState } from "../ServerState";

export class DamageSystem {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus
    ) {}

    applyDamage(targetId: string, damage: number, killerId?: string, knockback?: {dx:number,dy:number}, knockbackTimer: number = 20) {
        const target = this.serverState.getPlayer(targetId);
        if (!target) return;

        target.hp -= damage;

        if (target.hp <= 0 && !target.isDead) {
            target.isDead = true;
            target.state = EntityState.DEAD;
            this.eventBus.emit(EventBusMessage.ENTITY_DIED, {
                entityInfo: target.toInfo(),
                killerId:killerId
            });
            this.serverState.removeEntity(targetId);
        } else {
            this.eventBus.emit(EventBusMessage.ATTACK_RECEIVED, {
                attackResult: {
                    newHp: target.hp,
                    knockBackVector: knockback,
                    knockbackTimer
                } as AttackResult,
                socket: this.serverState.getPlayerSocket(target.id)
            });
        }
    }
}
