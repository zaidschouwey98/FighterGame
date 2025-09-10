import { PlayerState } from "../../../../../shared/PlayerState";
import { BaseState } from "./BaseState";
import type Player from "../Player";
import { EventBusMessage, type EventBus } from "../../EventBus";
import type { TeleportService } from "../../TeleportService";

export class TeleportState extends BaseState {
    readonly name = PlayerState.TELEPORTING;
    private timer = 1;

    constructor(player: Player, private teleportService: TeleportService, private eventBus: EventBus) {
        super(player);
    }

    canEnter(): boolean {
        return !(this.teleportService.getTeleportCooldown() > 0);
    }

    enter() {
        this.timer = 1;
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
        this.teleportService.teleportPlayer(this.player);
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());

    }

    update(delta: number) {
        this.timer -= delta;
        if (this.timer <= 0) {
            this.teleportService.resetTeleportCooldown();
            this.player.changeState(this.player.idleState);
        }
    }

    exit() {

    }
}
