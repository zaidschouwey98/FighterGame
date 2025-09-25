import type { Hitbox } from "./Hitbox";
import { PlayerState } from "./PlayerState";

// export interface AttackData {
//     playerId: string;
//     attackType: AttackType;
//     position: { x: number; y: number };
//     rotation: number;
//     knockbackStrength: number;
    
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
    playerAction: PlayerState;
    attackIndex: number;
}

export interface MeleeAttackData extends AttackDataBase {
    hitbox: Hitbox;
}

export interface ProjectileAttackData extends AttackDataBase {

}