import { EntityState } from "../../PlayerState";
import type Position from "../../Position";
import { AttackHitboxService } from "./AttackHitboxService";
import { Weapon } from "./Weapon";
import { WeaponType } from "../../WeaponType";
import { HEAVY_SWORD_ATTACK_1_BASE_DURATION, HEAVY_SWORD_ATTACK_3_BASE_DURATION, HEAVY_SWORD_CD } from "../../constantes";
import { AttackDataBase, AttackType, MeleeAttackData } from "../../AttackData";

export class HeavySword extends Weapon {
    readonly name = WeaponType.HEAVY_SWORD;
    constructor() {
        super(20, HEAVY_SWORD_CD, 3, 10)
    }

    public useWeapon(playerPos: Position, attackDir: number): AttackDataBase {
        let res: MeleeAttackData = {
            attackType: AttackType.MELEE,
            hitbox: AttackHitboxService.createHitbox(playerPos, attackDir, 70),
            playerId: "",
            position: playerPos,
            rotation: attackDir,
            knockbackStrength: this._knockbackStrength,
            playerAction: EntityState.ATTACK,
            attackIndex:this._attackCurrentCombo,
        };
        this._attackCurrentCombo = ((this._attackCurrentCombo + 1)% this._attackMaxCombo)
        return res;
    }

    public getAttackDuration(attackSpeed:number):number{
        if(this._attackCurrentCombo == 0 ||this._attackCurrentCombo == 1)
            return HEAVY_SWORD_ATTACK_1_BASE_DURATION / attackSpeed;
        return HEAVY_SWORD_ATTACK_3_BASE_DURATION / attackSpeed;
    }
    
    public isDashAttack(): boolean {
        return this._attackCurrentCombo === 2;
    }
}