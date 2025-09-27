

// export interface AttackData {
//     playerId: string;
//     attackType: AttackType;
//     position: { x: number; y: number };
//     rotation: number;
//     knockbackStrength: number;

import { EntityState } from "../messages/EntityState";
import { Hitbox } from "./Hitbox";

    
//     playerAction:PlayerState;
//     attackIndex:number;
// }

export enum AttackType {
    MELEE,
    PROJECTILE
}

export interface AttackDataBase {
    attackType: AttackType;
    playerId: string;
    position: { x: number; y: number };
    rotation: number;
    knockbackStrength: number;
    playerAction: EntityState;
    attackIndex: number;
}

export interface MeleeAttackData extends AttackDataBase {
    hitbox: Hitbox;
}

export interface ProjectileAttackData extends AttackDataBase {

}