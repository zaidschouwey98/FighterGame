import { ENTITY_BASE_CRIT_CHANCE, FIREBALL_SPEED as PROJECTILE_SPEED } from "../../../constantes";
import { EntityInfo } from "../../../EntityInfo";
import { EntityType } from "../../../EntityType";
import Position from "../../../Position";
import { MovementService } from "../../../services/MovementService";
import { Entity } from "../../Entity";
import { IEntityCollisionHandler } from "../../IEntityCollisionHandler";
import { ProjectileInfo } from "./ProjectileInfo";

export class Projectile extends Entity {
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
        super(ownerId + "_proj_" + Projectile.counter++, position, movingVector, 5, 10, 10, ENTITY_BASE_CRIT_CHANCE, PROJECTILE_SPEED, false, EntityType.PROJECTILE, projectileCollisionHandler);
    }

    public updateFromInfo(info: EntityInfo): void {
        throw new Error("Method not implemented");
    }

    public toInfo(): ProjectileInfo {
        return {
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