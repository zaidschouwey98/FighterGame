import type { Container, Spritesheet } from "pixi.js";
import { WeaponType } from "../../../../../shared/WeaponType";
import type { AnimController } from "../AnimController";
import { WeaponSprite } from "./WeaponSprite";
import { PlayerState } from "../../../../../shared/PlayerState";
import { HeavySwordBodyAttack1 } from "./weapon_anim/heavy_sword/HeavySwordBodyAttack1";

export class WeaponFactory {
  constructor(private type: WeaponType, private skin = "default") {}

  createWeaponSprite(
    spriteSheets: Spritesheet[],
    parent: Container,
    playerController: AnimController,
  ): WeaponSprite {
    switch (this.type) {
      case WeaponType.HEAVY_SWORD:
        // ajoute anims du joueur propres à l’épée
        playerController.register(PlayerState.ATTACK, [new HeavySwordBodyAttack1(spriteSheets, parent), new HeavySwordBodyAttack1(spriteSheets, parent)]);
        return new WeaponSprite(spriteSheets, parent, WeaponType.HEAVY_SWORD, this.skin, {x:0.92, y:0.5},0,3);

    //   case WeaponType.FIST:
    //     playerController.register(PlayerState.ATTACK, new FistAttackAnim(effectRenderer, spriteSheets, parent));
    //     return new WeaponSprite(spriteSheets, parent, WeaponType.FIST, this.skin);

      default:
        throw new Error("Unknown weapon type");
    }
  }
}
