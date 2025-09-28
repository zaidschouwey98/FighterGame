import { Entity } from "./Entity";
import { IEntityCollisionHandler } from "../player/IEntityCollisionHandler";
import Position from "../Position";
import { EntityType } from "../enums/EntityType";
import { ENTITY_BASE_CRIT_CHANCE } from "../constantes";
import { Direction } from "../enums/Direction";
import { Weapon } from "../player/weapons/Weapon";
import { HeavySword } from "../player/weapons/HeavySword";
import { EntityState } from "../messages/EntityState";
import { BaseState } from "../player/states/BaseState";
import { AbilityType } from "../enums/AbilityType";
import { Ability } from "../player/abilities/Ability";
import { IStatefulEntity } from "./IStatefulEntity";

export abstract class LivingEntity extends Entity implements IStatefulEntity {
    public hp: number;
    public maxHp: number;
    public speed: number;
    public critChance: number;

    public movingDirection: Direction = Direction.BOTTOM;
    public aimVector: { x: number, y: number } = { x: 0, y: 0 };
    public weapon: Weapon;
    public attackIndex = 0;
    public attackSpeed = 1;

    public currentState!: BaseState;
    private states: Map<EntityState, BaseState> = new Map();
    private abilities = new Map<AbilityType, Ability>();


    constructor(
        id: string,
        position: Position,
        radius: number,
        hp: number,
        maxHp: number,
        critChance: number = ENTITY_BASE_CRIT_CHANCE,
        speed: number,
        entityType: EntityType,
        entityCollisionHandler: IEntityCollisionHandler,
    ) {
        super(id, position, { dx: 0, dy: 0 }, radius, hp, maxHp, critChance, speed, false, entityType, entityCollisionHandler);
        this.hp = hp;
        this.maxHp = maxHp;
        this.critChance = critChance;
        this.speed = speed;
        this.weapon = new HeavySword()
    }

    public update(delta: number): void {
        this.currentState.update(delta);
        this.abilities.forEach(ability => ability.update(delta));
    }   

    public addState(state: BaseState): void {
        this.states.set(state.name, state);
    }

    public hasState(type: EntityState): boolean {
        return this.states.has(type);
    }

    public changeState(entityState: EntityState, params?: unknown): void {
        const nextState = this.states.get(entityState);
        if (!nextState) {
            console.warn(`State ${entityState} not found on entity ${this.id}`);
            return;
        }
        if (!nextState.canEnter()) return;
        this.currentState.exit();
        this.currentState = nextState;
        this.state = nextState.name;
        nextState.enter(params);
    }

    public addAbility(type: AbilityType, ability: Ability): void {
        this.abilities.set(type, ability);
    }

    public getAbility<T extends Ability>(type: AbilityType): T | undefined {
        return this.abilities.get(type) as T | undefined;
    }

    public die() {
        const deadState = this.states.get(EntityState.DEAD);
        if (!deadState)
            throw new Error(`State DEAD not found on entity ${this.id}`);
        this.currentState = deadState;
    }
}
