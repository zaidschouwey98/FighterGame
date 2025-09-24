import { EntityType } from "./EntityType";
import Position from "./Position";

export class EntityInfo {
    id:string;
    position: Position;
    movingVector: {dx:number, dy:number};
    radius: number;
    hp:number;
    maxHp:number;
    speed:number;
    isDead:boolean;
    entityType: EntityType;
    constructor(
        id: string = "",
        position: Position = new Position(0,0),
        movingVector: { dx: number, dy: number } = { dx: 0, dy: 0 },
        radius: number = 0,
        hp: number = 0,
        maxHp: number = 0,
        speed: number = 0,
        isDead: boolean = false,
        entityType: EntityType = EntityType.UNKNOWN
    ) {
        this.id = id;
        this.position = position;
        this.movingVector = movingVector;
        this.radius = radius;
        this.hp = hp,
        this.maxHp = maxHp;
        this.speed = speed;
        this.isDead = isDead;
        this.entityType = entityType; 
    }

    onCollisionEnter(other){
        
    }
}