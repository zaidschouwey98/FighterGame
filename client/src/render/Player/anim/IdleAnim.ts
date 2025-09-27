import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/enums/Direction";
import { findAnimation } from "../../../AssetLoader";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import type { IAnimState } from "../IAnimState";

export class IdleAnim implements IAnimState{
  private animations = new Map<Direction, AnimatedSprite>();
  private current?: AnimatedSprite;
  private lastDir?: Direction;

  constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
    const down = new AnimatedSprite(findAnimation(spriteSheets, "player_idle")!);
    const right = new AnimatedSprite(findAnimation(spriteSheets, "player_idle_right")!);
    const top = new AnimatedSprite(findAnimation(spriteSheets, "player_idle_back")!);
    const left = new AnimatedSprite(findAnimation(spriteSheets, "player_idle_right")!);
    left.scale.x = -1;

    // Init commun
    for (const s of [down, right, top, left]) {
      s.visible = false;
      s.animationSpeed = 0.1;
      s.anchor.set(0.5);
      playerContainer.addChild(s);
    }

    this.animations.set(Direction.BOTTOM, down);
    this.animations.set(Direction.RIGHT, right);
    this.animations.set(Direction.TOP, top);
    this.animations.set(Direction.LEFT, left);
  }

  public play(player: PlayerInfo) {
    const dir = player.movingDirection ?? Direction.BOTTOM;
    if (dir === this.lastDir && this.current) {
      return;
    }
    this.lastDir = dir;

    if (this.current) {
      this.current.stop();
      this.current.visible = false;
    }

    const next = this.animations.get(dir) ?? this.animations.get(Direction.BOTTOM)!;
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
