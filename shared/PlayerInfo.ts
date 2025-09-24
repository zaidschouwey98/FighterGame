import { PlayerState } from "./PlayerState";
import { Direction } from "./Direction";
import Position from "./Position";
import { WeaponType } from "./WeaponType";
import { EntityInfo } from "./EntityInfo";
import { EntityType } from "./EntityType";

export default interface PlayerInfo extends EntityInfo{
    mouseDirection: { x: number; y: number; };
    name?:string;
    state:PlayerState;
    movingDirection:Direction;
    weapon:WeaponType;
    currentXp:number;
    lvlXp: number;
    currentLvl: number;

    killStreak:number;
    killCounter:number;
    entityType: EntityType.PLAYER;
    pendingAttack?: boolean;
    attackIndex: number;
    attackSpeed: number;
    
    attackDashTimer?: number;   // Durée restante du dash
    attackDashDuration?: number; // Durée en frames
    attackDashMaxSpeed: number;

    knockbackReceivedVector?: { x: number; y: number };
}