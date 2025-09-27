import Position from "../Position";
import { EntityType } from "../enums/EntityType";

export interface EntityInfo {
    id:string;
    position: Position;
    movingVector: {dx:number, dy:number};
    radius: number;
    hp:number;
    maxHp:number;
    speed:number;
    critChance:number;
    isDead:boolean;
    entityType: EntityType;
}