import { LivingEntityInfo } from "./LivingEntityInfo";


export interface ProjectileInfo extends LivingEntityInfo {
    ownerId: string;
    damage: number;
    knockbackStrength: number;
}