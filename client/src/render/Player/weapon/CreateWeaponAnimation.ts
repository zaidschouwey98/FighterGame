
import type { Container, Sprite, Spritesheet } from "pixi.js";
import { WeaponType } from "../../../../../shared/enums/WeaponType";
import { EntityState } from "../../../../../shared/messages/EntityState";
import type { IWeaponAnim } from "./weapon_anim/IWeaponAnim";
import { IdleWeaponAnim } from "./weapon_anim/heavy_sword/IdleWeaponAnim";
import { HiddenWeaponAnim } from "./weapon_anim/HiddenWeaponAnim";
import { DashWeaponAnim } from "./weapon_anim/heavy_sword/DashWeaponAnim";
import { HeavySwordAttack1 } from "./weapon_anim/heavy_sword/HeavySwordAttack1";
import { HeavySwordAttack2 } from "./weapon_anim/heavy_sword/HeavySwordAttack2";
import { HeavySwordAttack3 } from "./weapon_anim/heavy_sword/HeavySwordAttack3";

export function createWeaponAnimations(sprite: Sprite, type: WeaponType, playerContainer:Container, spriteSheets:Spritesheet[]): Partial<Record<EntityState, IWeaponAnim | IWeaponAnim[]>> {
  switch (type) {
    case WeaponType.HEAVY_SWORD:
      return {
        [EntityState.IDLE]: new IdleWeaponAnim(sprite),
        [EntityState.MOVING]: new IdleWeaponAnim(sprite),
        [EntityState.ATTACK]: [
          new HeavySwordAttack1(sprite,playerContainer,spriteSheets),
          new HeavySwordAttack2(sprite,playerContainer,spriteSheets),
          new HeavySwordAttack3(sprite,playerContainer,spriteSheets),
        ],
        [EntityState.ATTACK_DASH]: new DashWeaponAnim(sprite),
        [EntityState.BLOCKING]: new HiddenWeaponAnim(sprite),
        [EntityState.DEAD]: new HiddenWeaponAnim(sprite),
        [EntityState.TELEPORTED]: new HiddenWeaponAnim(sprite),
        [EntityState.TELEPORTING]: new HiddenWeaponAnim(sprite),
      };

    case WeaponType.GUN:
      return {
        [EntityState.IDLE]: new IdleWeaponAnim(sprite),
        [EntityState.MOVING]: new IdleWeaponAnim(sprite),
        [EntityState.ATTACK]: [
          new HeavySwordAttack1(sprite,playerContainer,spriteSheets),
          new HeavySwordAttack2(sprite,playerContainer,spriteSheets),
          new HeavySwordAttack3(sprite,playerContainer,spriteSheets),
        ],
        [EntityState.ATTACK_DASH]: new DashWeaponAnim(sprite),
        [EntityState.BLOCKING]: new HiddenWeaponAnim(sprite),
        [EntityState.DEAD]: new HiddenWeaponAnim(sprite),
      };

    // case WeaponType.BOW:
    //   return {
    //     [PlayerState.IDLE]: new IdleWeaponAnim(sprite),
    //     [PlayerState.ATTACK]: new BowChargeAnim(sprite), // ou tu peux découper en Charge/Release selon attackIndex
    //     [PlayerState.DEAD]: new HiddenWeaponAnim(sprite),
    //   };

    // case WeaponType.FIST:
    //   return {
    //     [PlayerState.IDLE]: new IdleWeaponAnim(sprite),
    //     [PlayerState.ATTACK]: new HiddenWeaponAnim(sprite), // anim de poings plus tard
    //     [PlayerState.DEAD]: new HiddenWeaponAnim(sprite),
    //   };

    default:
      return {};
  }
}
