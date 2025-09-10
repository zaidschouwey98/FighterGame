import { TP_COOLDOWN, TP_DISTANCE } from "../constantes";
import type { CoordinateService } from "./CoordinateService";
import { EventBusMessage, type EventBus } from "./EventBus";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";

export class TeleportService {
  private teleportCooldown = TP_COOLDOWN;
  private readonly teleportDistance = TP_DISTANCE;

  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService,
    private eventBus: EventBus
  ) { }

  public update(player: Player, delta: number) {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= delta;
      if (this.teleportCooldown < 0) this.teleportCooldown = 0;
    }
    if (this.inputHandler.consumeSpaceClick() && this.teleportCooldown === 0) {
      this.teleportPlayer(player);
      this.teleportCooldown = TP_COOLDOWN;
    }
  }

  private teleportPlayer(player: Player) {
    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);

    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    const newX = player.position.x + (dx / len) * this.teleportDistance;
    const newY = player.position.y + (dy / len) * this.teleportDistance;

    player.position.x = newX;
    player.position.y = newY;


    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, player.toInfo());

  }
}