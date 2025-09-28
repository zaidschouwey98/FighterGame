import type { Player } from "../entities/Player";
import type { IInputHandler } from "../../client/src/core/IInputHandler";
import Position from "../Position";
import { EntityInfo } from "../messages/EntityInfo";
import { IStatefulEntity } from "../entities/IStatefulEntity";

export class MovementService {
  constructor(private inputHandler: IInputHandler) { }

  public getMovementDelta(): { dx: number; dy: number } {
    let dx = 0, dy = 0;

    if (this.inputHandler.getKeys().has("w")) dy -= 1;
    if (this.inputHandler.getKeys().has("s")) dy += 1;
    if (this.inputHandler.getKeys().has("a")) dx -= 1;
    if (this.inputHandler.getKeys().has("d")) dx += 1;

    return { dx, dy };
  }

  public static calculateNextPos(entity: EntityInfo, delta:number): Position {
    let dx = entity.movingVector.dx;
    let dy = entity.movingVector.dy;
    const speed = entity.speed;
    if (dx === 0 && dy === 0) return entity.position;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
      throw new Error("Should be normalized vector");
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    return {x: entity.position.x + dx * speed / 4 * delta, y:entity.position.y + dy * speed / 4 * delta};
  }

  public static moveEntity(player: Player | EntityInfo | IStatefulEntity, delta:number, changedSpeed?:number) {
    let dx = player.movingVector.dx;
    let dy = player.movingVector.dy;
    let speed = changedSpeed || player.speed;
    if (dx === 0 && dy === 0) return;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
      throw new Error("Should be normalized vector");
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    player.position.x += dx * speed / 4 * delta;
    player.position.y += dy * speed / 4 * delta;
  }
}
