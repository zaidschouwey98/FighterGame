import { PlayerState } from "../../PlayerState";
import { BaseState } from "./BaseState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import type { TeleportService } from "../../services/TeleportService";
import { ClientPlayer } from "../ClientPlayer";

export class TeleportState extends BaseState {
    readonly name = PlayerState.TELEPORTING;
    private timer = 1;

    constructor(player: ClientPlayer, private teleportService: TeleportService, private eventBus: EventBus) {
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
