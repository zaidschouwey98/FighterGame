import { Action } from "./Action";
import { Direction } from "./Direction";
import type PlayerInfo from "./PlayerInfo";
import Position from "./Position";

// WHEN ADDING PROP, ENSURE TO ADD PROP IN PLAYERINFO AND IN toInfo() DOWN THERE
export default class Player {
    public position: Position;
    public hp: number;
    public speed: number;
    public id: string;
    protected _currentAction: Action;
    public currentDirection?: Direction;

    public pendingAttackDir?: number;
    public pendingAttack?: boolean;
    public attackIndex: number = 0;

    public blockDir?:{x:number,y:number};
    public blockTimer?: number;   // Frames restantes de block
    public isBlocking?: boolean;  // True si le joueur bloque

    public attackDashTimer?: number; // durée restante du dash
    public attackDashDuration = 40; // durée en frames
    public dashDir = { x: 0, y: 0 };
    public attackDashMaxSpeed = 3;
    public isDead:boolean = false;

    public knockbackReceived?: { x: number; y: number };
    public knockbackTimer?: number;

    public hitFlashTimer?: number;
    constructor(
        position: Position,
        hp: number = 100,
        speed: number = 10,
        id: string
    ) {

        this.id = id;
        this.position = new Position(position.x, position.y);
        this.hp = hp;
        this.speed = speed;
        this._currentAction = Action.IDLE_DOWN;

    }


    public set currentAction(action: Action) {
        this._currentAction = action;
    }

    public get currentAction() {
        return this._currentAction;
    }

    public toInfo(): PlayerInfo {
        return {
            position: this.position,
            hp: this.hp,
            speed: this.speed,
            id: this.id,
            _currentAction: this._currentAction,
            currentDirection: this.currentDirection,
            pendingAttackDir: this.pendingAttackDir,
            pendingAttack: this.pendingAttack,
            attackIndex: this.attackIndex,
            blockTimer: this.blockTimer,
            isBlocking: this.isBlocking,
            attackDashTimer: this.attackDashTimer,
            attackDashDuration: this.attackDashDuration,
            dashDir: this.dashDir,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            knockbackReceived: this.knockbackReceived,
            knockbackTimer: this.knockbackTimer,
            hitFlashTimer: this.hitFlashTimer,
            isDead: this.isDead,
            blockDir:this.blockDir
        };
    }

}