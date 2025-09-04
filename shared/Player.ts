import { Action } from "./Action";
import { Direction } from "./Direction";
import Position from "./Position";

export default class Player{
    public position: Position;
    public hp: number;
    public speed: number;
    public id:string;
    public currentAction:Action;
    public currentDirection?: Direction;
    
    public pendingAttackDir?: number;
    public pendingAttack?: boolean;
    public attackIndex:number = 0;

    public blockTimer?: number;   // Frames restantes de block
    public isBlocking?: boolean;  // True si le joueur bloque

    public attackDashTimer?: number; // durée restante du dash
    public attackDashDuration = 40; // durée en frames
    public dashDir = {x: 0, y: 0};
    public attackDashMaxSpeed = 3;

    public knockbackReceived?: { x: number; y: number };
    public knockbackTimer?: number;
    constructor(position: Position, hp: number, speed: number, id:string) {
        this.id = id;
        this.position = position;
        this.hp = hp;
        this.speed = speed;
        this.currentAction = Action.IDLE_DOWN;
    }
}