import type { Hitbox } from "./Hitbox";
import { PlayerState } from "./PlayerState";

export interface AttackData {
    playerId: string;
    position: { x: number; y: number };
    rotation: number;
    knockbackStrength: number;
    hitbox: Hitbox;
    playerAction:PlayerState;
    attackIndex:number;
}