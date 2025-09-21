import { TP_COOLDOWN, TP_DISTANCE } from "../constantes";
import type { IInputHandler } from "./IInputHandler";
import type Player from "./player/Player";

export class TeleportService {
  private teleportCooldown = TP_COOLDOWN;
  private readonly teleportDistance = TP_DISTANCE;

  constructor(
    private inputHandler: IInputHandler,
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
    const worldMousePos = this.inputHandler.getMousePosition();

    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    const newX = player.position.x + (dx / len) * this.teleportDistance;
    const newY = player.position.y + (dy / len) * this.teleportDistance;

    player.position.x = newX;
    player.position.y = newY;
  }
}