import { EntityInfo } from "./EntityInfo";
import { EntityType } from "./EntityType";

export interface Projectile extends EntityInfo {
    entityType: EntityType.PROJECTILE;
    damage: number;
    knockbackStrength: number;
}