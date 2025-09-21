import type { AttackData } from "../../AttackData";
import { PlayerState } from "../../PlayerState";
import type Position from "../../Position";
import { AttackHitboxService } from "./AttackHitboxService";
import { Weapon } from "./Weapon";
import { WeaponType } from "../../WeaponType";

export class HeavySword extends Weapon {
    readonly name = WeaponType.HEAVY_SWORD;
    constructor() {
        super(20, 20, 20, 3)
    }

    public useWeapon(playerPos: Position, attackDir: number): AttackData {
        let res: AttackData = {
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

    public getAttackDuration():number{
        if(this._attackCurrentCombo == 0 ||this._attackCurrentCombo == 1)
            return 40;
        return 10;
    }
    
    public isDashAttack(): boolean {
        return this._attackCurrentCombo === 2;
    }
}