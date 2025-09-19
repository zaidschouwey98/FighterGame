import { PlayerState } from "../../../../../shared/PlayerState";
import { BaseState } from "./BaseState";
import type Player from "../Player";
import { EventBusMessage, type EventBus } from "../../EventBus";
import { BLOCK_DURATION } from "../../../constantes";
import type { BlockService } from "../../BlockService";
import type { InputHandler } from "../../InputHandler";

export class BlockState extends BaseState {
    readonly name = PlayerState.BLOCKING;
    private blockDuration = BLOCK_DURATION;
    constructor(
        player: Player,
        private eventBus: EventBus,
        private blockService: BlockService,
        private inputHandler:InputHandler,
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
        this.blockService.startBlock(this.player,this.blockDuration)
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        if(this.inputHandler.consumeAttack()){
            this.player.changeState(this.player.attackState);
        }
        if (this.player.blockTimer !== undefined) {
            this.player.blockTimer -= delta;
            if (this.player.blockTimer <= 0) {
                this.blockService.resetBlockCD();
                this.player.changeState(this.player.idleState);
                return;
            }
        }
    }

    exit() {
        this.player.blockTimer = undefined;
    }
}
