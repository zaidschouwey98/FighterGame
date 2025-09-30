import { Direction } from "../enums/Direction";
import { WeaponType } from "../enums/WeaponType";
import { EntityInfo } from "./EntityInfo";

export interface LivingEntityInfo extends EntityInfo{
    hp: number;
    maxHp:number;
    speed: number;
    critChance: number;
    movingDirection: Direction;
    aimVector: { x: number, y: number };
    weaponType: WeaponType;
    attackIndex: number;
    attackSpeed: number;
}