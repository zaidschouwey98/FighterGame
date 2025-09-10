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
import { HitState } from "./states/HitState";
import { DieState } from "./states/DieState";
import { BlockState } from "./states/BlockState";
import type { BlockService } from "../BlockService";
import { KnockBackState } from "./states/KnockBackState";
import { TeleportState } from "./states/TeleportState";
import type { TeleportService } from "../TeleportService";

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
    public attackDashState: AttackDashState;
    public attack1State: Attack1State;
    public hitState: HitState;
    public dieState: DieState;
    public blockState: BlockState;
    public knockbackState:KnockBackState;
    public teleportState: TeleportState;
    constructor(
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        id: string,
        eventBus: EventBus,
        inputHandler: InputHandler,
        attackService: AttackService,
        movementService: MovementService,
        blockService:BlockService,
        teleportService:TeleportService
    ) {
        this.playerName = playerName
        this.id = id;
        this.position = new Position(position.x, position.y);
        this.hp = hp;
        this.speed = speed;

        this.idleState = new IdleState(this, inputHandler, eventBus);
        this.currentState = this.idleState;
        this.movingState = new MovingState(this, inputHandler, movementService, eventBus);
        this.attackDashState = new AttackDashState(this, attackService, eventBus,inputHandler);
        this.attack1State = new Attack1State(this, attackService, eventBus);
        this.hitState = new HitState(this, eventBus);
        this.dieState = new DieState(this, eventBus);
        this.blockState = new BlockState(this,eventBus,blockService);
        this.knockbackState = new KnockBackState(this,eventBus);
        this.teleportState = new TeleportState(this,teleportService,eventBus);
    }

    public update(delta: number) {
        this.currentState.update(delta);
    }

    public takeDamage(newHp: number) {
        this.hp = newHp;
        if(this.currentState.name === PlayerState.DEAD)
            return;
        this.changeState(this.hitState);
    }


    public die() {
        this.changeState(this.dieState);
    }

    public respawn(position: Position) {
        this.position = position;
        this.hp = 100; // ou config
        this.changeState(this.idleState);
    }

    public changeState(nextState: BaseState) {
        if(!nextState.canEnter())
            return;
        this.currentState.exit();
        this.currentState = nextState;
        nextState.enter();
    }

    get state(): PlayerState {
        return this.currentState.name;
    }

    // Utiliser uniquement lors de la création du joueur local
    public updateFromInfo(info: PlayerInfo) {
        this.position = info.position;
        this.hp = info.hp;
        this.playerName = info.name;
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
            name: this.playerName,
            id: this.id,
            state: this.state,
        };
    }
}