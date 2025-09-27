import { Entity } from "../../shared/entities/Entity";
import { IEntityCollisionHandler } from "../../shared/player/IEntityCollisionHandler";
import { EntityInfo } from "../../shared/messages/EntityInfo";

export class ServerPlayerCollisionHandler implements IEntityCollisionHandler{
    handleCollision(source: Entity, target: EntityInfo): void {
        
    }
}