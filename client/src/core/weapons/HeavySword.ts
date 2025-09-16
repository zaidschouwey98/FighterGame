import type { AttackData } from "../../../../shared/AttackData";
import { PlayerState } from "../../../../shared/PlayerState";
import type Position from "../../../../shared/Position";
import { AttackHitboxService } from "./AttackHitboxService";
import { Weapon } from "./Weapon";
import { WeaponType } from "../../../../shared/WeaponType";

export enum HeavySwordAttack {
  SLASH_1,
  SLASH_2,
  SLASH_3
}

export class HeavySword extends Weapon {
    readonly name = WeaponType.HEAVY_SWORD;
    constructor() {
        super(20, 20, 20, 2)
    }

    public useWeapon(playerPos: Position, attackDir: number): AttackData {
        let res = {
            hitbox: AttackHitboxService.createHitbox(playerPos, attackDir, 70),
            playerId: "",
            position: playerPos,
            rotation: attackDir,
            knockbackStrength: 20,
            playerAction: PlayerState.ATTACK,
            attackIndex:this._attackCurrentCombo,
        };
        this._attackCurrentCombo = ((this._attackCurrentCombo + 1)% this._attackMaxCombo)
        return res;
    }
}