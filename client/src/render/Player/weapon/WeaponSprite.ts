import { Container, Spritesheet, Sprite } from "pixi.js";
import { WeaponAnimController } from "./weapon_anim/WeaponAnimController";
import { findTexture } from "../../../AssetLoader";
import { Direction } from "../../../../../shared/enums/Direction";
import type { WeaponType } from "../../../../../shared/enums/WeaponType";
import { createWeaponAnimations } from "./CreateWeaponAnimation";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import { EntityState } from "../../../../../shared/messages/EntityState";

/** Corps joueur : zIndex 0. Ombre arme -2. Épée derrière (N) ou devant (S). */
const Z_WEAPON_BEHIND = -1;
const Z_WEAPON_FRONT = 1;
const Z_SHADOW = -2;

export class WeaponSprite {
  private sprite: Sprite;
  private shadowSprite: Sprite;
  private controller: WeaponAnimController;
  private currentDirection: Direction = Direction.BOTTOM;
  private lastState: EntityState = EntityState.IDLE;

  constructor(spriteSheets: Spritesheet[], _staticEffectContainer: Container, playerContainer: Container, type: WeaponType, skin = "default", anchor: { x: number, y: number }, posX: number, posY: number) {
    console.log(skin)
    playerContainer.sortableChildren = true;

    this.sprite = new Sprite(findTexture(spriteSheets, type as any));
    this.sprite.anchor = anchor;
    this.sprite.x = posX;
    this.sprite.y = posY;
    this.sprite.label = "weapon";

    const groundShadow = new Sprite(findTexture(spriteSheets, type as any));
    groundShadow.label = "weaponShadow";
    groundShadow.anchor = anchor;
    groundShadow.x = this.sprite.x;
    groundShadow.y = this.sprite.y;
    groundShadow.tint = 0x000000;
    groundShadow.alpha = 0.3;
    groundShadow.scale.y = 1;
    groundShadow.zIndex = Z_SHADOW;
    this.shadowSprite = groundShadow;

    playerContainer.addChild(this.shadowSprite);
    playerContainer.addChild(this.sprite);

    this.applyDepthForDirection(this.currentDirection);

    this.controller = new WeaponAnimController(createWeaponAnimations(this.sprite, type, playerContainer, spriteSheets));
  }

  setState(playerInfo: PlayerInfo) {
    this.lastState = playerInfo.state;
    this.controller.setState(playerInfo);
    if (!this.isDepthLockedByAnim()) {
      this.applyDepthForDirection(this.currentDirection);
    }
  }

  setDirection(direction: Direction) {
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;
      this.controller.setDirection(direction);
    }
    if (!this.isDepthLockedByAnim()) {
      this.applyDepthForDirection(direction);
    }
  }

  /** Pendant swing, les anims gèrent le zIndex de l’épée autour du corps. */
  private isDepthLockedByAnim(): boolean {
    return this.lastState === EntityState.ATTACK || this.lastState === EntityState.ATTACK_DASH;
  }

  /**
   * Face nord (et diagonales N) → épée derrière le corps.
   * Face sud (et le reste) → épée devant.
   */
  private applyDepthForDirection(dir: Direction) {
    const behind =
      dir === Direction.TOP ||
      dir === Direction.TOP_LEFT ||
      dir === Direction.TOP_RIGHT;
    this.sprite.zIndex = behind ? Z_WEAPON_BEHIND : Z_WEAPON_FRONT;
    this.shadowSprite.zIndex = Z_SHADOW;
  }

  update(delta: number) {
    this.shadowSprite.scale = this.sprite.scale;
    this.shadowSprite.rotation = this.sprite.rotation;
    this.shadowSprite.x = this.sprite.x;
    this.shadowSprite.y = this.sprite.y + 4;
    this.shadowSprite.visible = this.sprite.visible;
    this.controller.update(delta);
  }

  destroy() {
    this.sprite.destroy({ children: true });
    this.shadowSprite.destroy({ children: true });
  }
}
