import { EntityType } from "./EntityType";
import Position from "./Position";

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