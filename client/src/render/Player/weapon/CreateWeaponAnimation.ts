
import type { Sprite } from "pixi.js";
import { WeaponType } from "../../../../../shared/WeaponType";
import { PlayerState } from "../../../../../shared/PlayerState";
import type { IWeaponAnim } from "./weapon_anim/IWeaponAnim";
import { IdleWeaponAnim } from "./weapon_anim/heavy_sword/IdleWeaponAnim";
import { HiddenWeaponAnim } from "./weapon_anim/HiddenWeaponAnim";
import { DashWeaponAnim } from "./weapon_anim/heavy_sword/DashWeaponAnim";
import { HeavySwordAttack1 } from "./weapon_anim/heavy_sword/HeavySwordAttack1";
import { HeavySwordAttack2 } from "./weapon_anim/heavy_sword/HeavySwordAttack2";

export function createWeaponAnimations(sprite: Sprite, type: WeaponType): Partial<Record<PlayerState, IWeaponAnim | IWeaponAnim[]>> {
  switch (type) {
    case WeaponType.HEAVY_SWORD:
      return {
        [PlayerState.IDLE]: new IdleWeaponAnim(sprite),
        [PlayerState.ATTACK]: [
          new HeavySwordAttack1(),
          new HeavySwordAttack2(),
        ],
        [PlayerState.ATTACK_DASH]: new DashWeaponAnim(sprite),
        [PlayerState.BLOCKING]: new HiddenWeaponAnim(sprite),
        [PlayerState.DEAD]: new HiddenWeaponAnim(sprite),
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
