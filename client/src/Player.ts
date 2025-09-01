import { Action } from "./enums/Action";
import Position from "./Position";

export default class Player{
    public position: Position;
    public hp: number;
    public speed: number;
    public id:string;
    public currentAction:Action;
    constructor(position: Position, hp: number, speed: number, id:string) {
        this.id = id;
        this.position = position;
        this.hp = hp;
        this.speed = speed;
        this.currentAction = Action.IDLE_DOWN;
    }
}