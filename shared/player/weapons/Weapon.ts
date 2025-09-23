import type { AttackData } from "../../AttackData";
import type Position from "../../Position";
import type { WeaponType } from "../../WeaponType";

export abstract class Weapon {
    abstract readonly name: WeaponType;
    protected _weaponDamage:number;
    protected _attackCoolDown:number;
    protected _attackMaxCombo: number;
    protected _attackCurrentCombo: number;

    constructor(weaponDamage:number, attackCoolDown:number, attackMaxCombo:number){
        this._weaponDamage = weaponDamage;
        this._attackCoolDown = attackCoolDown;
        this._attackMaxCombo = attackMaxCombo;
        this._attackCurrentCombo = 0;
    }

    public resetCombo(){
        this._attackCurrentCombo = 0;
    }
    
    public get attackCurrentCombo(): number{
        return this._attackCurrentCombo;
    }
    
    public attackCoolDown(attackSpeed:number) : number {
        return this._attackCoolDown / attackSpeed;
    }
    

    public get weaponDamage() : number {
        return this._weaponDamage;
    }

    public abstract isDashAttack():boolean;

    public abstract getAttackDuration(attackSpeed:number):number;

    public abstract useWeapon(playerPos:Position, attackDir:number):AttackData;
}