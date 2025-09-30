import Position from "../Position";
import { EntityType } from "../enums/EntityType";
import { EntityState } from "./EntityState";

export interface EntityInfo {
    state: EntityState;
    id:string;
    position: Position;
    movingVector: {dx:number, dy:number};
    radius: number;
    isDead:boolean;
    entityType: EntityType;
}