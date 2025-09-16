import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";

export class HeavySwordAttack1 implements IWeaponAnim {
    play(): void {
        console.log("swordattack1")
    }
    stop(): void {
        
    }
    update(_delta: number): void {
        
    }
    setDirection(_dir: Direction): void {
        
    }
    
}