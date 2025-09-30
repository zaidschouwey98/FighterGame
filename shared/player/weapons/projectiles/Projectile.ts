import { ENTITY_BASE_CRIT_CHANCE, FIREBALL_SPEED as PROJECTILE_SPEED } from "../../../constantes";
import { EntityType } from "../../../enums/EntityType";
import { EntityInfo } from "../../../messages/EntityInfo";
import Position from "../../../Position";
import { MovementService } from "../../../services/MovementService";
import { IEntityCollisionHandler } from "../../IEntityCollisionHandler";
import { ProjectileInfo } from "../../../messages/ProjectileInfo";
import { LivingEntity } from "../../../entities/LivingEntity";

export class Projectile extends LivingEntity {
    private static counter = 0;
    constructor(
        position: Position,
        private lifeTime: number,
        movingVector: { dx: number, dy: number },
        readonly ownerId: string,
        public damage: number,
        readonly knockbackStrength: number,
        projectileCollisionHandler: IEntityCollisionHandler,
        private onTimeOut: ()=>void
    ) {
        super(ownerId + "_proj_" + Projectile.counter++, position, 5, 10, 10, ENTITY_BASE_CRIT_CHANCE, PROJECTILE_SPEED, EntityType.PROJECTILE, projectileCollisionHandler);
    }

    public updateFromInfo(info: EntityInfo): void {
        throw new Error("Method not implemented");
    }

    public toInfo(): ProjectileInfo {
        return {
            attackSpeed: 0, 
            state: this.state,
            movingDirection: this.movingDirection,
            aimVector: this.aimVector,
            weaponType: this.weaponType,
            attackIndex: this.attackIndex,
            critChance: this.critChance,
            entityType: EntityType.PROJECTILE,
            ownerId: this.ownerId,
            damage: this.damage,
            knockbackStrength: this.knockbackStrength,
            id: this.id,
            position: this.position,
            movingVector: this.movingVector,
            radius: this.radius,
            hp: this.hp,
            maxHp: this.maxHp,
            speed: this.speed,
            isDead: this.isDead
        }
    }

    public update(delta: number) {
        MovementService.moveEntity(this, delta);
        this.lifeTime -= delta;
        if(this.lifeTime < 0)
            this.onTimeOut();
    }

}