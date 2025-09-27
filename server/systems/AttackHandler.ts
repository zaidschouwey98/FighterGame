import { Socket } from "socket.io";
import { AttackDataBase, MeleeAttackData, ProjectileAttackData } from "../../shared/AttackData";
import PlayerInfo from "../../shared/PlayerInfo";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { HitboxValidationService } from "../HitboxValidationService";
import { ServerState } from "../ServerState";
import { Projectile } from "../../shared/player/weapons/projectiles/Projectile";
import { ServerProjectileCollisionHandler } from "../collisions/ServerProjectileCollisionHandler";
import { PhysicsService } from "../../shared/services/PhysicsService";
import { DamageSystem } from "./DamageSystem";
import { Player } from "../../shared/player/LivingEntity";

export interface AttackHandler {
    handle(data: AttackDataBase, socket?: Socket): void;
}

export class MeleeAttackHandler implements AttackHandler {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus,
        private damageSystem: DamageSystem
    ) { }

    handle(data: MeleeAttackData, socket?: Socket): void {
        const attacker = this.serverState.getEntity(data.playerId);
        if (!attacker) return;

        attacker.position = data.position;
        attacker.state = data.playerAction;

        const hitPlayerIds = HitboxValidationService.getTargetsInHitbox(
            data.hitbox,
            this.serverState.getPlayers(),
            data.playerId
        );

        const attackResults: PlayerInfo[] = [];
        let killNumber = 0;

        for (const targetId of hitPlayerIds) {
            const target = this.serverState.getEntity(targetId) as Player;
            if (!target) continue;
            attackResults.push(target.toInfo());

            if (target.hp <= 0 && !target.isDead) {
                killNumber++;
            }
            if (target.hp < 0)
                continue;
            this.damageSystem.applyDamage(
                target.id,
                20,                      // damage
                attacker.id,             // killer
                PhysicsService.computeKnockback(attacker.position, target.position, data.knockbackStrength),
                40
            );
        }
    }
}

export class ProjectileAttackHandler implements AttackHandler {
    constructor(
        private serverState: ServerState,
        private eventBus: EventBus,
        private damageSystem: DamageSystem
    ) { }
    handle(data: ProjectileAttackData, socket?: Socket): void {
        let dx = Math.cos(data.rotation);
        let dy = Math.sin(data.rotation);
        let proj = new Projectile(data.position, 40, { dx: dx, dy: dy }, data.playerId, 20, 3, new ServerProjectileCollisionHandler(this.damageSystem), ()=>{
            this.eventBus.emit(EventBusMessage.ENTITY_DIED, { entityInfo: proj.toInfo()})
            
        })
        this.serverState.addEntity(proj);
    }
}
