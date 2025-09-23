import type { Player } from "../player/Player";
import type PlayerInfo from "../PlayerInfo";
import type { IInputHandler } from "../../client/src/core/IInputHandler";

export class MovementService {
  constructor(private inputHandler: IInputHandler) {}

  public getMovementDelta(): { dx: number; dy: number } {
    let dx = 0, dy = 0;

    if (this.inputHandler.getKeys().has("w")) dy -= 1;
    if (this.inputHandler.getKeys().has("s")) dy += 1;
    if (this.inputHandler.getKeys().has("a")) dx -= 1;
    if (this.inputHandler.getKeys().has("d")) dx += 1;

    return { dx, dy };
  }

  public static movePlayer(player: Player | PlayerInfo, dx: number, dy: number, delta: number, speed:number = player.speed) {
    if (dx === 0 && dy === 0) return;
    if(Math.abs(dx) > 1 || Math.abs(dy) > 1)
      throw new Error("Should be normalized vector");
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    player.position.x += dx * speed/4 * delta;
    player.position.y += dy * speed/4 * delta;
  }
}
