import { EntityState } from "../PlayerState";
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
import { ClientPlayerCollisionHandler } from "./ClientPlayerCollisionHandler";

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
        super(id, playerName, position, hp, speed, new ClientPlayerCollisionHandler());

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

    public update(delta: number): void {
        this.currentState.update(delta);
        this.blockService.update(delta);
        this.attackService.update(delta, this);
        this.teleportService.update(delta);
        this.inputHandler.update();
    }

    public handleAttackReceived(attackResult: AttackResult) {
        this.hp = attackResult.newHp;
        this.knockbackReceivedVector = {x: attackResult.knockBackVector.dx, y: attackResult.knockBackVector.dy};
        this.changeState(
            new HitState(
                this,
                this.eventBus,
                this.inputHandler,
                attackResult.knockBackVector,
                attackResult.knockbackTimer,
            )
        );
    }

    public die() {
        this.currentState = this.dieState;
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
        this.state = nextState.name;
        nextState.enter();
    }
}
