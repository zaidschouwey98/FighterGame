import { PlayerState } from "./PlayerState";
import { Direction } from "./Direction";
import Position from "./Position";

export default interface PlayerInfo {
    mouseDirection: { x: number; y: number; };
    position: Position;
    hp: number;
    speed: number;
    id: string;
    name?:string;
    state:PlayerState;
    movingDirection:Direction;

    pendingAttack?: boolean;
    attackIndex: number;
    
    attackDashTimer?: number;   // Durée restante du dash
    attackDashDuration?: number; // Durée en frames
    attackDashMaxSpeed: number;

    knockbackReceivedVector?: { x: number; y: number };

    isDead:boolean;

}