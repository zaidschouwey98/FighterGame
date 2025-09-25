import { EntityInfo } from "../../shared/EntityInfo";
import { Entity } from "../../shared/player/Entity";
import { IEntityCollisionHandler } from "../../shared/player/IEntityCollisionHandler";

export class ServerProjectileCollisionHandler implements IEntityCollisionHandler {
    handleCollision(source: Entity, target: EntityInfo): void {

    }
    
}