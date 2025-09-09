import { PlayerState } from "../../../../shared/PlayerState";
import type PlayerInfo from "../../../../shared/PlayerInfo";
import Position from "../../../../shared/Position";
import { Direction } from "../../../../shared/Direction";
import { BaseState } from "./states/BaseState";
import { IdleState } from "./states/IdleState";
import { MovingState } from "./states/MovingState";
import type { EventBus } from "../EventBus";
import { MovementService } from "../MovementService";
import type { InputHandler } from "../InputHandler";
import { AttackDashState } from "./states/AttackDashState";
import { Attack1State } from "./states/Attack1State";
import { AttackService } from "../AttackService";

// WHEN ADDING PROP, ENSURE TO ADD PROP IN PLAYERINFO AND IN toInfo() DOWN THERE
export default class Player {
    public hp: number;
    public speed: number;
    public id: string;
    public playerName?: string;
    public isDead: boolean = false;
    public position: Position;
    public movingDirection: Direction = Direction.BOTTOM;
    public mouseDirection: { x: number, y: number } = { x: 0, y: 0 };

    

    public attackIndex: number = 0;

    public blockTimer?: number;   // Frames restantes de block

    public attackDashTimer?: number; // durée restante du dash
    public attackDashDuration?: number; // durée en frames
    public attackDashMaxSpeed = 3; // TODO PUT THIS IN CONST

    public knockbackReceivedVector?: { x: number; y: number };
    public knockbackTimer?: number;

    public currentState: BaseState;
    public idleState: IdleState;
    public movingState: MovingState;
    public attackDashState:AttackDashState;
    public attack1State: Attack1State;
    constructor(
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        id: string,
        eventBus:EventBus,
        inputHandler: InputHandler,
        attackService: AttackService,
        movementService: MovementService,

    ) {
        this.playerName = playerName
        this.id = id;
        this.position = new Position(position.x, position.y);
        this.hp = hp;
        this.speed = speed;

        this.idleState = new IdleState(this, inputHandler, eventBus);
        this.currentState = this.idleState;
        this.movingState = new MovingState(this,movementService,eventBus);
        this.attackDashState = new AttackDashState(this, attackService, eventBus);
        this.attack1State = new Attack1State(this,attackService, eventBus);

    }

    public update(delta: number) {
        this.currentState.update(delta);
    }

    public changeState(nextState:BaseState) {
        this.currentState.exit();
        this.currentState = nextState;
        nextState.enter(); 
    }

    get state(): PlayerState {
        return this.currentState.name;
    }

    // Rarement utilisé
    public updateFromInfo(info: PlayerInfo) {
        this.position = info.position;
        this.hp = info.hp;
        this.speed = info.speed;
        this.attackDashDuration = info.attackDashDuration;
        this.attackDashMaxSpeed = info.attackDashMaxSpeed;
        this.attackDashTimer = info.attackDashTimer;
        this.attackIndex = info.attackIndex;
        this.blockTimer = info.blockTimer;
        this.knockbackReceivedVector = info.knockbackReceivedVector;
        this.knockbackTimer = info.knockbackTimer;
        this.mouseDirection = info.mouseDirection;
        this.movingDirection = info.movingDirection;

        this.isDead = info.isDead;
        // this.changeState(info.state);
    }

    public toInfo(): PlayerInfo {
        return {
            position: this.position,
            hp: this.hp,
            speed: this.speed,
            attackDashDuration: this.attackDashDuration,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            attackDashTimer: this.attackDashTimer,
            attackIndex: this.attackIndex,
            blockTimer: this.blockTimer,
            mouseDirection: this.mouseDirection,
            knockbackReceivedVector: this.knockbackReceivedVector,
            knockbackTimer: this.knockbackTimer,
            movingDirection: this.movingDirection,
            isDead: this.isDead,
            id: this.id,
            state: this.state,
        };
    }
}