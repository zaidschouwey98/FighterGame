import { EntityState } from "../../messages/EntityState";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { BaseState } from "./BaseState";
import { ClientPlayer } from "../../entities/ClientPlayer";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EntityCommand, EntityEvent, EventBus } from "../../services/EventBus";

export class KnockBackState extends BaseState {
    private knockbackVector: { dx: number; dy: number } = { dx: 0, dy: 0 };
    private knockbackTimer: number = 0;
    readonly name = EntityState.KNOCKBACK;
    constructor(
        entity: IStatefulEntity,
        private eventBus: EventBus,
        private inputHandler: IInputHandler,
    ) {
        super(entity);
    }

    enter(params?: { vector: { dx: number; dy: number }; duration: number }) {
        if (params) {
            this.knockbackVector = params.vector;
            this.knockbackTimer = params.duration;
        } else throw new Error("HitState requires knockback parameters on enter");
        this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        if (this.inputHandler.isSpaceDown()) {
            this.entity.changeState(EntityState.TELEPORTING);
        }

        if (this.knockbackTimer > 0) {
            this.entity.position.x += this.knockbackVector.dx * delta;
            this.entity.position.y += this.knockbackVector.dy * delta;

            const decayPerSecond = 0.85;
            const decay = Math.pow(decayPerSecond, delta);
            this.knockbackVector.dx *= decay;
            this.knockbackVector.dy *= decay;

            this.knockbackTimer -= delta;
            if (this.knockbackTimer <= 0) {
                this.entity.changeState(EntityState.IDLE);
            }

            this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());
        }
    }

    exit() {

    }
}