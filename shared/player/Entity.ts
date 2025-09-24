import { EntityInfo } from "../EntityInfo";
import { EntityType } from "../EntityType";
import Position from "../Position";

export abstract class Entity {
    constructor(
        public id: string,
        public position: Position,
        public movingVector: { dx: number, dy: number },
        public radius: number,
        public hp: number,
        public maxHp: number,
        public speed: number,
        public isDead: boolean,
        public entityType: EntityType,
    ) {}

    public abstract updateFromInfo(info: EntityInfo):void;

    public abstract onCollideWith(entity: EntityInfo):void;

    public abstract toInfo(): EntityInfo;
}