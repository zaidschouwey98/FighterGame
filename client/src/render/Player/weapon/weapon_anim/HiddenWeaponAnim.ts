import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "./IWeaponAnim";
import type { Direction } from "../../../../../../shared/Direction";

export class HiddenWeaponAnim implements IWeaponAnim{

  constructor(private sprite: Sprite) {}

  play() {
    this.sprite.visible = false;
  }

  stop() {
    this.sprite.visible = true;
  }

  setDirection(_dir: Direction): void {
    
  }

  update() {


  }
}
