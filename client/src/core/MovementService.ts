import type Player from "./player/Player";
import { TILE_SIZE } from "../constantes";
import type PlayerInfo from "../../../shared/PlayerInfo";
import type { IInputHandler } from "./IInputHandler";

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

  public movePlayer(player: Player | PlayerInfo, dx: number, dy: number, delta: number, speed:number = player.speed) {
    if (dx === 0 && dy === 0) return;

    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;

    player.position.x += dx * speed * TILE_SIZE * delta / 60;
    player.position.y += dy * speed * TILE_SIZE * delta / 60;
  }
}
