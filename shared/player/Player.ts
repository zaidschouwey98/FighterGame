import { PlayerState } from "../PlayerState";
import type PlayerInfo from "../PlayerInfo";
import Position from "../Position";
import { Direction } from "../Direction";
import { BaseState } from "./states/BaseState";
import { IdleState } from "./states/IdleState";
import { MovingState } from "./states/MovingState";
import type { EventBus } from "../services/EventBus";
import { MovementService } from "../services/MovementService";
import { AttackDashState } from "./states/AttackDashState";
import { AttackState } from "./states/AttackState";
import { AttackService } from "../services/AttackService";
import { HitState } from "./states/HitState";
import { DieState } from "./states/DieState";
import { BlockState } from "./states/BlockState";
import { BlockService } from "../services/BlockService";
import { KnockBackState } from "./states/KnockBackState";
import { TeleportState } from "./states/TeleportState";
import { TeleportService } from "../services/TeleportService";
import type { AttackResult } from "../AttackResult";
import { PhysicsService } from "../services/PhysicsService";
import type { Weapon } from "./weapons/Weapon";
import { HeavySword } from "./weapons/HeavySword";
import type { IInputHandler } from "../../client/src/core/IInputHandler";

// WHEN ADDING PROP, ENSURE TO ADD PROP IN PLAYERINFO AND IN toInfo() DOWN THERE
export class Player {
    public hp: number;
    public maxHp: number;
    public speed: number;
    public id: string;
    public playerName?: string;
    public isDead: boolean = false;
    public position: Position;
    public movingDirection: Direction = Direction.BOTTOM;
    public movingVector: { dx: number, dy: number } = { dx: 0, dy: 0 }
    public mouseDirection: { x: number, y: number } = { x: 0, y: 0 };
    public currentXp:number = 0;
    public lvlXp: number = 100;
    public currentLvl: number = 1;

    public weapon: Weapon;

    public killCounter = 0;
    public killStreak = 0;

    public attackIndex: number = 0;
    public attackSpeed: number = 1;

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
    public attackState: AttackState;
    public dieState: DieState;
    public blockState: BlockState;
    public teleportState: TeleportState;

    public attackService: AttackService;
    public movementService: MovementService;
    public teleportService: TeleportService;
    public blockService: BlockService;
    constructor(
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        id: string,
        private eventBus: EventBus,
        private inputHandler: IInputHandler,
    ) {
        this.playerName = playerName
        this.id = id;
        this.position = new Position(position.x, position.y);
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.weapon = new HeavySword();
        this.idleState = new IdleState(this, inputHandler, eventBus);
        this.currentState = this.idleState;

        this.attackService = new AttackService(inputHandler);
        this.movementService = new MovementService(inputHandler);
        this.blockService = new BlockService(inputHandler);
        this.teleportService = new TeleportService(inputHandler);

        this.movingState = new MovingState(this, inputHandler, this.movementService, eventBus);
        this.attackDashState = new AttackDashState(this, this.attackService, eventBus, inputHandler);
        this.attackState = new AttackState(this, this.attackService, this.movementService, eventBus);
        this.dieState = new DieState(this, eventBus);
        this.blockState = new BlockState(this, eventBus, this.blockService, inputHandler);
        this.teleportState = new TeleportState(this, this.teleportService, eventBus);
    }

    public update(delta: number) {
        this.currentState.update(delta);
        this.blockService.update(delta);
        this.attackService.update(delta,this);
        this.teleportService.update(delta);
        this.inputHandler.update();
    }



    public handleAttackReceived(attackResult: AttackResult, getPlayerPosition: (id: string) => Position) {

        const hitPlayers = attackResult.hitPlayers;
        if (attackResult.attackerId === this.id && attackResult.killNumber > 0) {
            this.killCounter += attackResult.killNumber;
        }
        if (attackResult.attackerId === this.id && attackResult.blockedBy != undefined) {
            this.knockbackReceivedVector = PhysicsService.computeKnockback(getPlayerPosition(attackResult.blockedBy.id), this.position, attackResult.knockbackStrength);
            this.changeState(
                new KnockBackState(
                    this,
                    this.eventBus,
                    this.inputHandler,
                    PhysicsService.computeKnockback(getPlayerPosition(attackResult.blockedBy.id), this.position, attackResult.knockbackStrength),
                    attackResult.knockbackTimer
                ))
        }
        for (const hit of hitPlayers) {
            if (hit.id === this.id) {
                if (attackResult.blockedBy?.id === this.id)
                    continue;
                this.knockbackReceivedVector = PhysicsService.computeKnockback(getPlayerPosition(attackResult.attackerId), this.position, attackResult.knockbackStrength),
                    this.takeDamage(hit.hp, PhysicsService.computeKnockback(getPlayerPosition(attackResult.attackerId), this.position, attackResult.knockbackStrength),
                        attackResult.knockbackTimer);
            }
        }
    }

    public takeDamage(newHp: number, knockbackVector: { x: number, y: number }, knockbackStrength: number) {
        this.hp = newHp;
        if (this.currentState.name === PlayerState.DEAD)
            return;
        this.changeState(new HitState(this, this.eventBus, this.inputHandler, knockbackVector, knockbackStrength));
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
        if (!nextState.canEnter())
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
        this.maxHp = info.maxHp;
        this.lvlXp = info.lvlXp;
        this.currentLvl = info.currentLvl;
        this.currentXp = info.currentXp;
        this.attackSpeed = info.attackSpeed;
        this.playerName = info.name;
        this.speed = info.speed;
        this.attackDashDuration = info.attackDashDuration;
        this.attackDashMaxSpeed = info.attackDashMaxSpeed;
        this.attackDashTimer = info.attackDashTimer;
        this.attackIndex = info.attackIndex;
        this.knockbackReceivedVector = info.knockbackReceivedVector;
        this.mouseDirection = info.mouseDirection;
        this.movingDirection = info.movingDirection;
        this.isDead = info.isDead;
    }

    public toInfo(): PlayerInfo {
        return {
            position: this.position,
            maxHp: this.maxHp,
            hp: this.hp,
            speed: this.speed,
            attackDashDuration: this.attackDashDuration,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            attackDashTimer: this.attackDashTimer,
            attackIndex: this.attackIndex,
            mouseDirection: this.mouseDirection,
            knockbackReceivedVector: this.knockbackReceivedVector,
            movingDirection: this.movingDirection,
            isDead: this.isDead,
            name: this.playerName,
            id: this.id,
            state: this.state,
            killCounter: this.killCounter,
            killStreak: this.killStreak,
            weapon: this.weapon.name,
            movingVector: this.movingVector,
            attackSpeed: this.attackSpeed,

            currentXp: this.currentXp,
            lvlXp: this.lvlXp,
            currentLvl: this.currentLvl,
        };
    }
}