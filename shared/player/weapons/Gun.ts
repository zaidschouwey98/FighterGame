import { GUN_ATTACK_BASE_DURATION } from "../../constantes";
import { EntityState } from "../../messages/EntityState";
import Position from "../../Position";
import { WeaponType } from "../../enums/WeaponType";
import { Weapon } from "./Weapon";
import { AttackType, ProjectileAttackData } from "../../types/AttackData";

export class Gun extends Weapon {
    readonly name: WeaponType = WeaponType.GUN;

    constructor(){
        super(20,40,1,20);
    }

    public isDashAttack(): boolean {
        return false;
    }
    public getAttackDuration(attackSpeed: number): number {
       return GUN_ATTACK_BASE_DURATION / attackSpeed;
    }
    public useWeapon(entityPos: Position, attackDir: number): ProjectileAttackData {
        let proj: ProjectileAttackData = {
            attackType: AttackType.PROJECTILE,
            playerId: "",
            position: entityPos,
            rotation: attackDir,
            knockbackStrength: 20,
            playerAction: EntityState.IDLE,
            attackIndex: 0
        };
        return proj
    }
    
}