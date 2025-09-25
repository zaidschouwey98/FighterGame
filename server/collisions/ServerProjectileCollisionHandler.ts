import { EntityInfo } from "../../shared/EntityInfo";
import { Entity } from "../../shared/player/Entity";
import { IEntityCollisionHandler } from "../../shared/player/IEntityCollisionHandler";
import { Projectile } from "../../shared/player/weapons/projectiles/Projectile";

export class ServerProjectileCollisionHandler implements IEntityCollisionHandler {
    handleCollision(source: Projectile, target: Entity): void {
        if(target.id === source.ownerId)
            return;
        // Ici il faudrait faire parvenir au client qu'il a perdu des hp et qu'il est en knockbackstate.
        // Mais aussi au serverstate
    }
    
}