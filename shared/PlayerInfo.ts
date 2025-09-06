import { Action } from "./Action";
import { Direction } from "./Direction";
import Position from "./Position";

export default interface PlayerInfo {
    position: Position;
    hp: number;
    speed: number;
    id: string;
    name?:string;
    _currentAction: Action;
    currentDirection?: Direction;

    pendingAttackDir?: number;
    pendingAttack?: boolean;
    attackIndex: number;

    blockDir?:{x:number,y:number};
    blockTimer?: number;        // Frames restantes de block
    isBlocking?: boolean;       // True si le joueur bloque

    attackDashTimer?: number;   // Durée restante du dash
    attackDashDuration?: number; // Durée en frames
    dashDir: { x: number; y: number };
    attackDashMaxSpeed: number;

    knockbackReceived?: { x: number; y: number };
    knockbackTimer?: number;
    isDead:boolean;
    hitFlashTimer?: number;
}