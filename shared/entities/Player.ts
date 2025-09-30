import { EntityType } from "../enums/EntityType";
import Position from "../Position";
import { Direction } from "../enums/Direction";
import type PlayerInfo from "../messages/PlayerInfo";
import { Weapon } from "../player/weapons/Weapon";
import { IEntityCollisionHandler } from "../player/IEntityCollisionHandler";
import { MovementService } from "../services/MovementService";
import { HeavySword } from "../player/weapons/HeavySword";
import { ENTITY_BASE_CRIT_CHANCE } from "../constantes";
import { LivingEntity } from "./LivingEntity";

export class Player extends LivingEntity {
    public name?: string;
    public movingDirection: Direction = Direction.BOTTOM;
    public aimVector: { x: number, y: number } = { x: 0, y: 0 };
    public currentXp = 0;
    public lvlXp = 100;
    public currentLvl = 1;

    public killCounter = 0;
    public killStreak = 0;
    
    public attackIndex = 0;
    public attackSpeed = 1;

    public attackDashTimer?: number;
    public attackDashDuration?: number;
    public attackDashMaxSpeed = 4.5;

    public knockbackReceivedVector?: { x: number; y: number };
    public knockbackTimer?: number;

    constructor(
        id: string,
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        playerCollisionHandler: IEntityCollisionHandler, 
        baseWeapon: Weapon,
    ) {
        super(id, position, 10, hp, hp, ENTITY_BASE_CRIT_CHANCE, speed, EntityType.PLAYER, playerCollisionHandler, baseWeapon);
        this.name = playerName;
    }

    public update(delta: number): void {
        MovementService.moveEntity(this, delta);
    }

    public updateFromInfo(info: PlayerInfo) {
        this.entityType = EntityType.PLAYER;
        this.position = info.position;
        this.maxHp = info.maxHp;
        this.hp = info.hp;
        this.speed = info.speed;
        this.attackDashDuration = info.attackDashDuration;
        this.attackDashMaxSpeed = info.attackDashMaxSpeed;
        this.attackDashTimer = info.attackDashTimer;
        this.attackIndex = info.attackIndex;
        this.aimVector = info.aimVector;
        this.knockbackReceivedVector = info.knockbackReceivedVector;
        this.movingDirection = info.movingDirection;
        this.isDead = info.isDead;
        this.name = info.name;
        this.id = info.id;
        this.state = info.state;
        this.killCounter = info.killCounter;
        this.killStreak = info.killStreak;
        this.critChance = info.critChance;
        // this.weapon = info.weapon;
        this.movingVector = info.movingVector;
        this.attackSpeed = info.attackSpeed;
        this.radius = info.radius;
        this.currentXp = info.currentXp;
        this.lvlXp = info.lvlXp;
        this.currentLvl = info.currentLvl;
    }

    public toInfo(): PlayerInfo {
        return {
            entityType: EntityType.PLAYER,
            position: this.position,
            maxHp: this.maxHp,
            hp: this.hp,
            critChance: this.critChance,
            speed: this.speed,
            attackDashDuration: this.attackDashDuration,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            attackDashTimer: this.attackDashTimer,
            attackIndex: this.attackIndex,
            aimVector: this.aimVector,
            knockbackReceivedVector: this.knockbackReceivedVector,
            movingDirection: this.movingDirection,
            isDead: this.isDead,
            name: this.name,
            id: this.id,
            state: this.state,
            killCounter: this.killCounter,
            killStreak: this.killStreak,
            weaponType: this.weapon.name,
            movingVector: this.movingVector,
            attackSpeed: this.attackSpeed,
            radius: this.radius,
            currentXp: this.currentXp,
            lvlXp: this.lvlXp,
            currentLvl: this.currentLvl,
        };
    }

    
}
