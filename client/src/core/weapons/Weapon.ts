import type { AttackData } from "../../../../shared/AttackData";
import type Position from "../../../../shared/Position";
import type { WeaponType } from "../../../../shared/WeaponType";

export abstract class Weapon {
    abstract readonly name: WeaponType;
    protected _weaponDamage:number;
    protected _attackCoolDown:number;
    protected _attackDuration: number;
    protected _attackMaxCombo: number;
    protected _attackCurrentCombo: number;

    constructor(weaponDamage:number, attackCoolDown:number, attackDuration:number, attackMaxCombo:number){
        this._weaponDamage = weaponDamage;
        this._attackCoolDown = attackCoolDown;
        this._attackDuration = attackDuration;
        this._attackMaxCombo = attackMaxCombo;
        this._attackCurrentCombo = 0;
    }

    public resetCombo(){
        this._attackCurrentCombo = 0;
    }
    
    public get attackCurrentCombo(): number{
        return this._attackCurrentCombo;
    }
    
    public get attackCoolDown() : number {
        return this._attackCoolDown;
    }
    

    public get weaponDamage() : number {
        return this._weaponDamage;
    }

    public abstract isDashAttack():boolean;

    public abstract getAttackDuration():number;

    public abstract useWeapon(playerPos:Position, attackDir:number):AttackData;
}