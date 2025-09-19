import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "../IWeaponAnim";
import { Direction } from "../../../../../../../shared/Direction";

export class IdleWeaponAnim implements IWeaponAnim {
  private time = 0;
  private baseY = 0;

  constructor(private sprite: Sprite) {
    this.baseY = sprite.y; // On enregistre la position Y de base
  }

  play() {
    this.sprite.visible = true;
    this.time = 0;
    this.baseY = this.sprite.y; // Toujours reprendre la position courante comme base
  }

  stop() {
    this.sprite.rotation = 0;
    this.sprite.y = this.baseY;
  }

  update(delta:number) {
    this.time += delta * 0.3; // Oscillation lente
    const offset = Math.sin(this.time) * 0.5; // Petit offset vertical
    this.sprite.y = this.baseY + offset;
    this.sprite.rotation = 0; // Pas de rotation idle
  }

  setDirection(_dir: Direction): void {
    // switch (dir) {
    //   case Direction.BOTTOM:
    //     this.sprite.rotation = 0;
    //     break;
    //   case Direction.TOP:
    //     this.sprite.rotation = 0;
    //     break;
    //   case Direction.LEFT:
    //     this.sprite.scale.x = 1;
    //     this.sprite.scale.y = 1;
    //     this.sprite.rotation = 0;
    //     break;
    //   case Direction.RIGHT:
    //     this.sprite.scale.x = -1;
    //     this.sprite.scale.y = 1;
    //     this.sprite.rotation = 0;
    //     break;
    
    //   default:
    //     break;
    // }
  }
}