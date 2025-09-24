import { PlayerState } from "../PlayerState";
import Position from "../Position";
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
import type { IInputHandler } from "../../client/src/core/IInputHandler";
import { Player } from "./Player";
import PlayerInfo from "../PlayerInfo";
import { EntityType } from "../EntityType";

export class ClientPlayer extends Player {
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
        id: string,
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        private eventBus: EventBus,
        private inputHandler: IInputHandler,
    ) {
        super(id, playerName, position, hp, speed);

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
        this.attackService.update(delta, this);
        this.teleportService.update(delta);
        this.inputHandler.update();
    }

    public handleAttackReceived(attackResult: AttackResult, getPlayerPosition: (id: string) => Position) {
        const hitPlayers = attackResult.hitPlayers;

        if (attackResult.attackerId === this.id && attackResult.killNumber > 0) {
            this.killCounter += attackResult.killNumber;
        }

        if (attackResult.attackerId === this.id && attackResult.blockedBy) {
            this.knockbackReceivedVector = PhysicsService.computeKnockback(
                getPlayerPosition(attackResult.blockedBy.id),
                this.position,
                attackResult.knockbackStrength
            );
            this.changeState(
                new KnockBackState(
                    this,
                    this.eventBus,
                    this.inputHandler,
                    this.knockbackReceivedVector,
                    attackResult.knockbackTimer
                )
            );
        }

        for (const hit of hitPlayers) {
            if (hit.id === this.id && attackResult.blockedBy?.id !== this.id) {
                this.knockbackReceivedVector = PhysicsService.computeKnockback(
                    getPlayerPosition(attackResult.attackerId),
                    this.position,
                    attackResult.knockbackStrength
                );
                this.takeDamage(hit.hp, this.knockbackReceivedVector, attackResult.knockbackTimer);
            }
        }
    }

    public takeDamage(newHp: number, knockbackVector: { x: number; y: number }, knockbackStrength: number) {
        this.hp = newHp;
        if (this.currentState.name === PlayerState.DEAD) return;
        this.changeState(new HitState(this, this.eventBus, this.inputHandler, knockbackVector, knockbackStrength));
    }

    public die() {
        this.changeState(this.dieState);
    }

    public respawn(position: Position) {
        this.position = position;
        this.hp = this.maxHp;
        this.changeState(this.idleState);
    }

    public changeState(nextState: BaseState) {
        if (!nextState.canEnter()) return;
        this.currentState.exit();
        this.currentState = nextState;
        nextState.enter();
    }

    get state(): PlayerState {
        return this.currentState.name;
    }

    public toInfo(): PlayerInfo {
        return {
            entityType: EntityType.PLAYER,
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
            radius: this.radius,
            currentXp: this.currentXp,
            lvlXp: this.lvlXp,
            currentLvl: this.currentLvl,
        };
    }
}
