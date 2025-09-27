import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/enums/Direction";
import { findAnimation } from "../../../AssetLoader";
import DirectionHelper from "../../../../../shared/DirectionHelper";
import type { EffectRenderer } from "../../EffectRenderer";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import { DASH_ATTACK_DURATION } from "../../../../../shared/constantes";
import type { IAnimState } from "../IAnimState";



export class AttackDashAnim implements IAnimState{
  private sprites = new Map<Direction, AnimatedSprite>();
  private current?: AnimatedSprite;
  private lastDir?: Direction;

  constructor(
    spriteSheets: Spritesheet[],
    playerContainer: Container,
    private effectRenderer: EffectRenderer
  ) {
    const loop = false;

    // RIGHT
    const right = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_right")!);
    // LEFT = flip du RIGHT
    const left = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_right")!);
    left.scale.x = -1;

    // TOP
    // const top = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_top")!);
    // // BOTTOM
    // const bottom = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_bottom")!);

    // // TOP_RIGHT
    // const tr = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_top_right")!);
    // // TOP_LEFT = flip du TOP_RIGHT
    // const tl = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_top_right")!);
    // tl.scale.x = -1;

    // // BOTTOM_RIGHT
    // const br = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_bottom_right")!);
    // // BOTTOM_LEFT = flip du BOTTOM_RIGHT
    // const bl = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_bottom_right")!);
    // bl.scale.x = -1;

    const all = [right, left];
    for (const s of all) {
      s.visible = false;
      s.animationSpeed = s.totalFrames/DASH_ATTACK_DURATION;
      s.loop = loop;           // dash souvent one-shot => false par défaut
      s.anchor.set(0.5);
      playerContainer.addChild(s);
    }

    this.sprites.set(Direction.RIGHT, right);
    this.sprites.set(Direction.LEFT, left);
    // this.sprites.set(Direction.TOP, top);
    // this.sprites.set(Direction.BOTTOM, bottom);
    // this.sprites.set(Direction.TOP_RIGHT, tr);
    // this.sprites.set(Direction.TOP_LEFT, tl);
    // this.sprites.set(Direction.BOTTOM_RIGHT, br);
    // this.sprites.set(Direction.BOTTOM_LEFT, bl);
  }

  /** À appeler quand on entre dans le state DASH (optionnel) */
  public enter(player:PlayerInfo) {
    this.effectRenderer.renderAttackDashCloud(player.position);
    this.lastDir = undefined; // force un choix/refresh à la première frame
  }

  public play(player: PlayerInfo) {
    const vec = player.mouseDirection ?? { x: 1, y: 0 };
    const dir = DirectionHelper.getDirectionByVector(vec, [
      Direction.RIGHT, Direction.LEFT
    ]);


    if (dir === this.lastDir && this.current) {
      return;
    }
    this.lastDir = dir;

    if (this.current) {
      this.current.stop();
      this.current.visible = false;
    }
    const next = this.sprites.get(dir);
    if (!next) return;
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
