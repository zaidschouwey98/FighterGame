// core/player/states/IdleState.ts
import { BaseState } from "./BaseState";
import { EntityState } from "../../messages/EntityState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { ClientPlayer } from "../../entities/ClientPlayer";

export class IdleState extends BaseState {
    readonly name = EntityState.IDLE;
    constructor(player: ClientPlayer, private inputHandler: IInputHandler, private eventBus: EventBus) {
        super(player)
    }
    enter() {
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(_delta: number) {
        const keys = this.inputHandler.getKeys();

        // Si des touches de mouvement sont pressées → passer en MovingState
        if (keys.has("w") || keys.has("a") || keys.has("s") || keys.has("d")) {
            this.player.changeState(this.player.movingState);
            return;
        }

        // Si clic gauche → attaque
        if (this.inputHandler.consumeAttack()) {
            this.player.changeState(this.player.attackState);
            return;
        }

        if (this.inputHandler.consumeRightClick()) {
            this.player.changeState(this.player.blockState);
            return;
        }

        // Si espace → dash
        if (this.inputHandler.isSpaceDown()) {
            this.player.changeState(this.player.teleportState);
        }

        if (this.inputHandler.consumeShift()) {
            this.player.changeState(this.player.attackDashState);
            return;
        }
    }
}
