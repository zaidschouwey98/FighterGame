import { EntityInfo } from "../../../EntityInfo";
import { EntityType } from "../../../EntityType";
import Position from "../../../Position";
import { Entity } from "../../Entity";
import { IEntityCollisionHandler } from "../../IEntityCollisionHandler";
import { ProjectileInfo } from "./ProjectileInfo";

export class Projectile extends Entity{
    private static counter = 0;

    constructor(
        position: Position,
        movingVector: {dx:number, dy:number},
        private ownerId: string,
        private damage: number,
        private knockbackStrength: number,
        projectileCollisionHandler: IEntityCollisionHandler
    ){
        super(ownerId + "_proj_" + Projectile.counter++, position,movingVector, 5,10,10,10,false, EntityType.PROJECTILE, projectileCollisionHandler);
    }

    public updateFromInfo(info: EntityInfo): void {
        throw new Error("Method not implemented");
    }

    public toInfo(): ProjectileInfo {
        return {
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

}