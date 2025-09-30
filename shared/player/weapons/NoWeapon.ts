import { WeaponType } from "../../enums/WeaponType";
import Position from "../../Position";
import { AttackDataBase } from "../../types/AttackData";
import { Weapon } from "./Weapon";

export class NoWeapon extends Weapon {
    readonly name: WeaponType = WeaponType.NONE;
    public isDashAttack(): boolean {
        throw new Error("Method not implemented.");
    }
    public getAttackDuration(attackSpeed: number): number {
        throw new Error("Method not implemented.");
    }
    public useWeapon(entityPos: Position, attackDir: number): AttackDataBase {
        throw new Error("Method not implemented.");
    }
    
}