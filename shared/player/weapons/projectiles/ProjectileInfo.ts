import { EntityInfo } from "../../../EntityInfo";
import { EntityType } from "../../../EntityType";

export interface ProjectileInfo extends EntityInfo {
    entityType: EntityType.PROJECTILE;
    ownerId: string;
    damage: number;
    knockbackStrength: number;
}