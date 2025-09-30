import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { BLOCK_DURATION } from "../../constantes";
import type { BlockService } from "../../services/BlockService";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { Ability } from "../abilities/Ability";
import { AbilityType } from "../../enums/AbilityType";
import { EntityCommand, EntityEvent, EventBus } from "../../services/EventBus";

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
        // Indiquer que le joueur est en blocage
        this.blockDuration = BLOCK_DURATION
        this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        if(this.inputHandler.consumeAttack()){
            this.entity.changeState(EntityState.ATTACK);
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
}
