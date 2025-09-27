import { Entity } from "./Entity";
import { IEntityCollisionHandler } from "../player/IEntityCollisionHandler";
import Position from "../Position";
import { EntityType } from "../enums/EntityType";
import { ENTITY_BASE_CRIT_CHANCE } from "../constantes";

export abstract class LivingEntity extends Entity {
    public hp: number;
    public maxHp: number;
    public speed: number;
    public critChance: number;

    constructor(
        id: string,
        position: Position,
        radius: number,
        hp: number,
        maxHp: number,
        critChance: number = ENTITY_BASE_CRIT_CHANCE,
        speed: number,
        entityType: EntityType,
        entityCollisionHandler: IEntityCollisionHandler,
    ) {
        super(id, position, { dx: 0, dy: 0 }, radius, hp, maxHp, critChance, speed, false, entityType, entityCollisionHandler);

        this.hp = hp;
        this.maxHp = maxHp;
        this.critChance = critChance;
        this.speed = speed;
    }
}
