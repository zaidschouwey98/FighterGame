import { TP_COOLDOWN, TP_DISTANCE } from "../constantes";
import type { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";

export class TeleportService {
  private teleportCooldown = TP_COOLDOWN;
  private readonly teleportDistance = TP_DISTANCE;

  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService
  ) { }

  public update(delta: number) {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= delta;
    }
  }

  public getTeleportCooldown():number{
    return this.teleportCooldown;
  }

  public resetTeleportCooldown(){
    this.teleportCooldown = TP_COOLDOWN;
  }

  public teleportPlayer(player: Player) {
    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);

    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    const newX = player.position.x + (dx / len) * this.teleportDistance;
    const newY = player.position.y + (dy / len) * this.teleportDistance;

    player.position.x = newX;
    player.position.y = newY;
  }
}