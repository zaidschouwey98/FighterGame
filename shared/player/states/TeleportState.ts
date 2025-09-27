import { IInputHandler } from "../../../client/src/core/IInputHandler";
import { EntityState } from "../../messages/EntityState";
import Position from "../../Position";
import { EventBus, EventBusMessage } from "../../services/EventBus";
import { TeleportService } from "../../services/TeleportService";
import { ClientPlayer } from "../../entities/ClientPlayer";
import { BaseState } from "./BaseState";
import { TeleportedState } from "./TeleportedState";

export class TeleportState extends BaseState {
    readonly name = EntityState.TELEPORTING;
    private timer = 150;
    private distance = 0;
    private readonly MAX_DISTANCE = 300;

    constructor(
        player: ClientPlayer,
        private teleportService: TeleportService,
        private eventBus: EventBus,
        private inputHandler: IInputHandler
    ) {
        super(player);
    }

    canEnter(): boolean {
        return !(this.teleportService.getTeleportCooldown() > 0);
    }

    enter() {
        this.timer = 150;
        this.distance = 50; // distance de base (si juste tapé)
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {
        this.timer -= delta;


        const world = this.inputHandler.getMousePosition();
        const dx = world.x - this.player.position.x;
        const dy = world.y - this.player.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        let tpVector = { x: 0, y: 0 };
        if (len > 0) {
            tpVector = { x: dx / len, y: dy / len };
        }

        if (this.inputHandler.isSpaceDown()) {
            this.distance += delta * 4; // ajuste la vitesse de "charge"
            if (this.distance > this.MAX_DISTANCE) {
                this.distance = this.MAX_DISTANCE;
            }
        } else {
            this.doTeleport(tpVector);
            return;
        }

        if (this.timer <= 0) {
            this.doTeleport(tpVector);
            return;
        }

        this.eventBus.emit(EventBusMessage.TELEPORT_DESTINATION_HELPER, new Position(this.player.position.x + tpVector.x * this.distance, this.player.position.y + tpVector.y * this.distance));
    }


    private doTeleport(tpVector: { x: number; y: number }) {
        this.player.changeState(new TeleportedState(this.player,this.eventBus));
        const destX = this.player.position.x + tpVector.x * this.distance;
        const destY = this.player.position.y + tpVector.y * this.distance;

        this.teleportService.teleportPlayer(this.player, destX, destY);
        this.teleportService.resetTeleportCooldown();
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
        this.eventBus.emit(EventBusMessage.TELEPORT_DESTINATION_HELPER); // Clear helper
        
    }


    exit() { }
}
