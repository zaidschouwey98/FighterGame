import { EntityInfo } from "../../shared/EntityInfo";
import { EntityType } from "../../shared/EntityType";
import { Entity } from "../../shared/player/Entity";
import { IEntityCollisionHandler } from "../../shared/player/IEntityCollisionHandler";
import { ProjectileInfo } from "../../shared/player/weapons/projectiles/ProjectileInfo";

export class ServerPlayerCollisionHandler implements IEntityCollisionHandler{
    handleCollision(source: Entity, target: EntityInfo): void {
        
    }
}