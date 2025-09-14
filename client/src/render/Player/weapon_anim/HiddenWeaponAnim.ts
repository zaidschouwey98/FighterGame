import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "./IWeaponAnim";

export class HiddenWeaponAnim implements IWeaponAnim{

  constructor(private sprite: Sprite) {}

  play() {
    this.sprite.visible = false;
  }

  stop() {
    
  }

  update() {


  }
}
