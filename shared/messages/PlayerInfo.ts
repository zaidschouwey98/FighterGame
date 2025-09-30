
import { LivingEntityInfo } from "./LivingEntityInfo";

export default interface PlayerInfo extends LivingEntityInfo{
    name?:string;
    currentXp:number;
    lvlXp: number;
    currentLvl: number;

    killStreak:number;
    killCounter:number;

    pendingAttack?: boolean;
    attackIndex: number;
    attackSpeed: number;
    
    attackDashTimer?: number;   // Durée restante du dash
    attackDashDuration?: number; // Durée en frames
    attackDashMaxSpeed: number;

    knockbackReceivedVector?: { x: number; y: number };
}