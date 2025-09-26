import { TP_COOLDOWN, TP_DISTANCE } from "../constantes";
import type { IInputHandler } from "../../client/src/core/IInputHandler";
import type { Player } from "../player/Player";

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

  public getTeleportCooldown(): number {
    return this.teleportCooldown;
  }

  public resetTeleportCooldown() {
    this.teleportCooldown = TP_COOLDOWN;
  }

  teleportPlayer(player: Player, destX: number, destY: number) {
    player.position.x = destX;
    player.position.y = destY;
  }
}