import { EntityInfo } from "../EntityInfo";
import { EntityType } from "../EntityType";
import { EntityState } from "../PlayerState";
import Position from "../Position";
import { IEntityCollisionHandler } from "./IEntityCollisionHandler";

export abstract class Entity {
    public state: EntityState = EntityState.IDLE;
    constructor(
        public id: string,
        public position: Position,
        public movingVector: { dx: number, dy: number },
        public radius: number,
        public hp: number,
        public maxHp: number,
        public critChance:number,
        public speed: number,
        public isDead: boolean,
        public entityType: EntityType,
        private entityCollisionHandler: IEntityCollisionHandler,
    ) {}

    public abstract update(delta: number): void;

    public abstract updateFromInfo(info: EntityInfo):void;

    public onCollideWith(entity: EntityInfo): void {
        this.entityCollisionHandler.handleCollision(this,entity);
    }
    
    public abstract toInfo(): EntityInfo;
}