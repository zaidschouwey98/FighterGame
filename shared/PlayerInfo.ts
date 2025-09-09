import { PlayerState } from "./PlayerState";
import { Direction } from "./Direction";
import Position from "./Position";

export default interface PlayerInfo {
    position: Position;
    hp: number;
    speed: number;
    id: string;
    name?:string;
    state:PlayerState;
    movingDirection:Direction;

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

    knockbackReceivedVector?: { x: number; y: number };
    knockbackTimer?: number;
    isDead:boolean;
    hitFlashTimer?: number;
}