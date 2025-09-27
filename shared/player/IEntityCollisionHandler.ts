import { EntityInfo } from "../messages/EntityInfo";
import { Entity } from "../entities/Entity";

export interface IEntityCollisionHandler {
    handleCollision(source: Entity, target: EntityInfo): void;
}