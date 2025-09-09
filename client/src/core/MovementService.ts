import type Player from "./player/Player";
import { InputHandler } from "./InputHandler";
import { TILE_SIZE } from "../constantes";

export class MovementService {
  constructor(private inputHandler: InputHandler) {}

  public getMovementDelta(): { dx: number; dy: number } {
    let dx = 0, dy = 0;

    if (this.inputHandler.getKeys().has("w")) dy -= 1;
    if (this.inputHandler.getKeys().has("s")) dy += 1;
    if (this.inputHandler.getKeys().has("a")) dx -= 1;
    if (this.inputHandler.getKeys().has("d")) dx += 1;

    return { dx, dy };
  }

  public movePlayer(player: Player, dx: number, dy: number, delta: number) {
    if (dx === 0 && dy === 0) return;

    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;

    player.position.x += dx * player.speed * TILE_SIZE * delta / 60;
    player.position.y += dy * player.speed * TILE_SIZE * delta / 60;
  }
}
