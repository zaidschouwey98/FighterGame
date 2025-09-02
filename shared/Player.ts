import { Action } from "./Action";
import Position from "./Position";

export default class Player{
    public position: Position;
    public hp: number;
    public speed: number;
    public id:string;
    public currentAction:Action;
    public dashVelocity?: { x: number, y: number }; // vitesse actuelle du dash
    public dashTimer?: number; // durée restante du dash
    public pendingAttackDir?: number;
    public pendingAttack?: boolean;
    public attackIndex:number = 0;
    constructor(position: Position, hp: number, speed: number, id:string) {
        this.id = id;
        this.position = position;
        this.hp = hp;
        this.speed = speed;
        this.currentAction = Action.IDLE_DOWN;
    }
}