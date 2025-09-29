import { EntityType } from "../enums/EntityType";
import { EntityState } from "../messages/EntityState";
import Position from "../Position";
import { IEntityCollisionHandler } from "../player/IEntityCollisionHandler";
import { EntityInfo } from "../messages/EntityInfo";
import { Direction } from "../enums/Direction";

export abstract class Entity {
    public state: EntityState = EntityState.IDLE;
    public movingDirection: Direction = Direction.BOTTOM;

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