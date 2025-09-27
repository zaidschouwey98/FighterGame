import { LivingEntity } from "./LivingEntity";
import { IEntityCollisionHandler } from "../player/IEntityCollisionHandler";
import Position from "../Position";
import { EntityType } from "../enums/EntityType";
import { MovementService } from "../services/MovementService";
import { MobInfo } from "../messages/MobInfo";

export class Mob extends LivingEntity {
    constructor(
        id: string,
        position: Position,
        hp: number,
        speed: number,
        private mobType: string,
        mobCollisionHandler: IEntityCollisionHandler,
    ) {
        super(id, position, 8, hp, hp, 0, speed, EntityType.MOB, mobCollisionHandler);
    }

    public update(delta: number): void {
        MovementService.moveEntity(this, delta);
    }

    public updateFromInfo(info: any) {
        this.position = info.position;
        this.hp = info.hp;
        this.isDead = info.isDead;
    }

    public toInfo(): MobInfo {
        return {
            id: "",
            position: this.position,
            movingVector: {
                dx: 0,
                dy: 0
            },
            radius: 0,
            hp: 0,
            maxHp: 0,
            speed: 0,
            critChance: 0,
            isDead: false,
            entityType: EntityType.MOB
        };
    }
}
