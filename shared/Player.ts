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

    public dashTimer?: number; // d urée restante du dash
    public dashDuration = 50; // durée en frames
    public dashDir = {x: 0, y: 0};
    public dashMaxSpeed = 3;
    constructor(position: Position, hp: number, speed: number, id:string) {
        this.id = id;
        this.position = position;
        this.hp = hp;
        this.speed = speed;
        this.currentAction = Action.IDLE_DOWN;
    }
}