import { AbilityType } from "../enums/AbilityType";
import { Direction } from "../enums/Direction";
import { EntityInfo } from "../messages/EntityInfo";
import { EntityState } from "../messages/EntityState";
import { Ability } from "../player/abilities/Ability";
import { BaseState } from "../player/states/BaseState";
import { Weapon } from "../player/weapons/Weapon";
import Position from "../Position";

export interface IStatefulEntity {
    id: string;
    state: EntityState;
    position: Position;
    aimVector: { x: number, y: number };
    movingDirection: Direction;
    movingVector: { dx: number, dy: number };
    isDead: boolean;
    speed: number;

    currentState: BaseState;

    weapon: Weapon;
    attackIndex: number;
    attackSpeed: number;

    addAbility(type: AbilityType, ability: Ability): void;
    getAbility<T extends Ability>(type: AbilityType): T | undefined;
    
    addState(state: BaseState): void;
    hasState(type: EntityState): boolean;
    changeState(state: EntityState, params?: unknown): void;
    toInfo(): EntityInfo;
}