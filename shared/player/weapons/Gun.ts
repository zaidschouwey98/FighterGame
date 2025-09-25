import { AttackType, ProjectileAttackData } from "../../AttackData";
import { GUN_ATTACK_BASE_DURATION } from "../../constantes";
import { PlayerState } from "../../PlayerState";
import Position from "../../Position";
import { WeaponType } from "../../WeaponType";
import { Weapon } from "./Weapon";

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
    public useWeapon(playerPos: Position, attackDir: number): ProjectileAttackData {
        let proj: ProjectileAttackData = {
            attackType: AttackType.PROJECTILE,
            playerId: "",
            position: playerPos,
            rotation: attackDir,
            knockbackStrength: 20,
            playerAction: PlayerState.IDLE,
            attackIndex: 0
        };
        return proj
    }
    
}