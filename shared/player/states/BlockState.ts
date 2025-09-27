import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import { BLOCK_DURATION } from "../../constantes";
import type { BlockService } from "../../services/BlockService";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { ClientPlayer } from "../../entities/ClientPlayer";

export class BlockState extends BaseState {
    readonly name = EntityState.BLOCKING;
    private blockDuration = BLOCK_DURATION;
    constructor(
        player: ClientPlayer,
        private eventBus: EventBus,
        private blockService: BlockService,
        private inputHandler:IInputHandler,
    ) {
        super(player);
    }

    canEnter(): boolean {
        if(this.blockService.getBlockCD() > 0)
            return false;
        else return true;
    }

    enter() {
        // Indiquer que le joueur est en blocage
        this.blockDuration = BLOCK_DURATION
        this.blockService.startBlock(this.player)
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        if(this.inputHandler.consumeAttack()){
            this.player.changeState(this.player.attackState);
        }
        
        this.blockDuration -= delta;
        if (this.blockDuration <= 0) {
            this.blockService.resetBlockCD();
            this.player.changeState(this.player.idleState);
            return;
        }
        
    }

    exit() {
    }
}
