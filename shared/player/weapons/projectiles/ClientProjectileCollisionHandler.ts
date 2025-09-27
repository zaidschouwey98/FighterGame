import { EntityInfo } from "../../../messages/EntityInfo";
import { Entity } from "../../../entities/Entity";
import { IEntityCollisionHandler } from "../../IEntityCollisionHandler";

export class ClientProjectileCollisionHandler implements IEntityCollisionHandler {
    handleCollision(source: Entity, target: EntityInfo): void {
        
    }
    
}