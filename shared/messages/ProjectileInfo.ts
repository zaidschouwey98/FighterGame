import { EntityType } from "../enums/EntityType";
import { EntityInfo } from "./EntityInfo";

export interface ProjectileInfo extends EntityInfo {
    entityType: EntityType.PROJECTILE;
    ownerId: string;
    damage: number;
    knockbackStrength: number;
}