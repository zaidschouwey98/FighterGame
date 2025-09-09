import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import type Player from "../../../core/player/Player";
import { findAnimation } from "../../../AssetLoader";
import type { IAnimState } from "./IAnimState";

export class MovingAnim implements IAnimState {
  private sprites = new Map<Direction, AnimatedSprite>();
  private current?: AnimatedSprite;
  private lastDir?: Direction;

  constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
    // Right
    const right = new AnimatedSprite(findAnimation(spriteSheets, "player_walk_right")!);
    // Left = flip du right
    const left = new AnimatedSprite(findAnimation(spriteSheets, "player_walk_right")!);
    left.scale.x = -1;
    // Up
    const up = new AnimatedSprite(findAnimation(spriteSheets, "player_walk_up")!);
    // Down
    const down = new AnimatedSprite(findAnimation(spriteSheets, "player_walk_down")!);

    const all = [right, left, up, down];
    for (const s of all) {
      s.visible = false;
      s.animationSpeed = 0.2;
      s.anchor.set(0.5);
      s.loop = true;
      playerContainer.addChild(s);
    }

    this.sprites.set(Direction.RIGHT, right);
    this.sprites.set(Direction.LEFT, left);
    this.sprites.set(Direction.TOP, up);
    this.sprites.set(Direction.BOTTOM, down);
  }

  public play(player: Player) {
    const dir = player.movingDirection ?? Direction.BOTTOM;

    // si même direction, ne pas reset l'anim
    if (dir === this.lastDir && this.current) return;
    this.lastDir = dir;

    if (this.current) {
      this.current.stop();
      this.current.visible = false;
    }

    const next = this.sprites.get(dir) ?? this.sprites.get(Direction.BOTTOM)!;
    next.visible = true;
    next.gotoAndPlay(0);
    this.current = next;
  }

  public stop() {
    if (!this.current) return;
    this.current.stop();
    this.current.visible = false;
    this.current = undefined;
    this.lastDir = undefined;
  }
}
