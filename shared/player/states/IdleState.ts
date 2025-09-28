// core/player/states/IdleState.ts
import { BaseState } from "./BaseState";
import { EntityState } from "../../messages/EntityState";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EntityEvent, EventBus } from "../../services/EventBus";

export class IdleState extends BaseState {
    readonly name = EntityState.IDLE;
    constructor(entity: IStatefulEntity, private inputHandler: IInputHandler, private eventBus: EventBus) {
        super(entity)
    }
    enter() {
        this.eventBus.emit(EntityEvent.UPDATED, this.entity.toInfo());
    }

    update(_delta: number) {
        const keys = this.inputHandler.getKeys();

        // Si des touches de mouvement sont pressées → passer en MovingState
        if (keys.has("w") || keys.has("a") || keys.has("s") || keys.has("d")) {
            this.entity.changeState(EntityState.MOVING);
            return;
        }

        // Si clic gauche → attaque
        if (this.inputHandler.consumeAttack()) {
            this.entity.changeState(EntityState.ATTACK);
            return;
        }

        if (this.inputHandler.consumeRightClick()) {
            this.entity.changeState(EntityState.BLOCKING);
            return;
        }

        // Si espace → dash
        if (this.inputHandler.isSpaceDown()) {
            this.entity.changeState(EntityState.TELEPORTING);
        }

        if (this.inputHandler.consumeShift()) {
            this.entity.changeState(EntityState.ATTACK_DASH);
            return;
        }
    }
}
