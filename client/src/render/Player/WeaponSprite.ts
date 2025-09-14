import { Container, Spritesheet, Sprite } from "pixi.js";
import { WeaponAnimController } from "./WeaponAnimController";
import { PlayerState } from "../../../../shared/PlayerState";
import { IdleWeaponAnim } from "./weapon_anim/IdleWeaponAnim";
import { findTexture } from "../../AssetLoader";
import { Direction } from "../../../../shared/Direction";
import { HiddenWeaponAnim } from "./weapon_anim/HiddenWeaponAnim";
import { DashWeaponAnim } from "./weapon_anim/DashWeaponAnim";


export class WeaponSprite {
  private sprite: Sprite;
  private controller: WeaponAnimController;
  private currentDirection: Direction = Direction.BOTTOM;

  constructor(spriteSheets: Spritesheet[], parent: Container) {
    this.sprite = new Sprite(findTexture(spriteSheets, "sword"));
    this.sprite.anchor.set(0.92, 0.5);
    this.sprite.y += 3;
    this.sprite.zIndex = 1;
    this.sprite.rotation = 0.3;
    parent.addChild(this.sprite);

    this.controller = new WeaponAnimController({
      [PlayerState.IDLE]: new IdleWeaponAnim(this.sprite),
      [PlayerState.MOVING]: new IdleWeaponAnim(this.sprite),
      [PlayerState.ATTACK_1]: new HiddenWeaponAnim(this.sprite),
      [PlayerState.BLOCKING]: new HiddenWeaponAnim(this.sprite),
      [PlayerState.ATTACK_DASH]: new DashWeaponAnim(this.sprite)
    });
  }

  setState(state: PlayerState) {
    this.controller.setState(state);
  }

  setDirection(direction: Direction) {
    if (direction != this.currentDirection) {
      this.setRotationByDirection(direction);
      this.currentDirection = direction
    }
  }

  update(delta: number) {
    this.controller.update(delta);

  }

  private setRotationByDirection(direction: Direction) {
    let scaleX = 1;
    let rotation = 0.3;
    let zIndex = 1;

    switch (direction) {
      case Direction.TOP:
        rotation = Math.PI + 0.3;
        zIndex = -1;
        break;
      case Direction.RIGHT:
        rotation = -0.3;
        break;
      case Direction.LEFT:
        scaleX = -1;
        break;
    }

    this.applyWeaponTransform(this.sprite, scaleX, rotation, zIndex);
  }

  private applyWeaponTransform(
    target: Sprite,
    scaleX: number,
    rotation: number,
    zIndex: number
  ) {
    target.scale.x = scaleX;
    target.rotation = rotation;
    target.zIndex = zIndex;
  }

}
