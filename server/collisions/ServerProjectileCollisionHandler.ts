import { AttackResult } from "../../shared/AttackResult";
import { EntityInfo } from "../../shared/EntityInfo";
import { EntityType } from "../../shared/EntityType";
import { Entity } from "../../shared/player/Entity";
import { IEntityCollisionHandler } from "../../shared/player/IEntityCollisionHandler";
import { Projectile } from "../../shared/player/weapons/projectiles/Projectile";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { PhysicsService } from "../../shared/services/PhysicsService";
import { ServerState } from "../ServerState";
import { DamageSystem } from "../systems/DamageSystem";

// One per Projectile
export class ServerProjectileCollisionHandler implements IEntityCollisionHandler {
    private lastHitEntityId: string = "";
    constructor(
        private damageSystem: DamageSystem
    ) { }

    handleCollision(source: Projectile, target: Entity): void {
        if (target.id === source.ownerId)
            return;
        if (target.entityType === EntityType.PLAYER && target.id != this.lastHitEntityId) {
            this.lastHitEntityId = target.id;
            this.damageSystem.applyDamage(
                target.id,
                source.damage,
                source.ownerId,
                PhysicsService.computeKnockback(source.position, target.position, source.knockbackStrength),
                10
            );
        }
    }

}