import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { BLOCK_DURATION } from "../../constantes";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { Ability } from "../abilities/Ability";
import { AbilityType } from "../../enums/AbilityType";
import { EntityCommand, EventBus } from "../../services/EventBus";

export class BlockState extends BaseState {
    readonly name = EntityState.BLOCKING;
    private blockAbility?: Ability;
    private blockDuration = BLOCK_DURATION;
    constructor(
        entity: IStatefulEntity,
        private eventBus: EventBus,
        private inputHandler:IInputHandler,
    ) {
        super(entity);
    }

    canEnter(): boolean {
        this.blockAbility = this.entity.getAbility(AbilityType.BLOCK);
        if(!this.blockAbility) return false;
        return (this.blockAbility.canUse());
    }

    enter() {
        this.blockDuration = BLOCK_DURATION;
        this.syncAimFromMouse();
        this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        this.syncAimFromMouse();
        this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());

        if (this.inputHandler.consumeAttack()) {
            if (this.entity.changeState(EntityState.ATTACK)) return;
        }
        
        this.blockDuration -= delta;
        if (this.blockDuration <= 0) {
            this.blockAbility!.use(this.entity);
            this.entity.changeState(EntityState.IDLE);
            return;
        }
        
    }

    exit() {
    }

    /** Parade orientée vers la souris (direction du bouclier) */
    private syncAimFromMouse() {
        const world = this.inputHandler.getMousePosition();
        const dx = world.x - this.entity.position.x;
        const dy = world.y - this.entity.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.entity.aimVector = { x: dx / len, y: dy / len };
    }
}
