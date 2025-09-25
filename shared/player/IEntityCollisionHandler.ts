import { EntityInfo } from "../EntityInfo";
import { Entity } from "./Entity";

export interface IEntityCollisionHandler {
    handleCollision(source: Entity, target: EntityInfo): void;
}