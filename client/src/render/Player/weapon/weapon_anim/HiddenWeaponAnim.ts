import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "./IWeaponAnim";
import type { Direction } from "../../../../../../shared/enums/Direction";
import type PlayerInfo from "../../../../../../shared/messages/PlayerInfo";

export class HiddenWeaponAnim implements IWeaponAnim{

  constructor(private sprite: Sprite) {}

  play(_playerInfo:PlayerInfo) {
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
