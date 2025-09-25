import { EntityType } from "../EntityType";
import Position from "../Position";
import { Direction } from "../Direction";
import type PlayerInfo from "../PlayerInfo";
import type { Weapon } from "./weapons/Weapon";
import { Entity } from "./Entity";
import { PlayerState } from "../PlayerState";
import { IEntityCollisionHandler } from "./IEntityCollisionHandler";
import { Gun } from "./weapons/Gun";
import { MovementService } from "../services/MovementService";

export class Player extends Entity {
    public playerName?: string;
    public movingDirection: Direction = Direction.BOTTOM;
    public mouseDirection: { x: number, y: number } = { x: 0, y: 0 };
    public currentXp = 0;
    public lvlXp = 100;
    public currentLvl = 1;

    public weapon: Weapon = new Gun();
    public killCounter = 0;
    public killStreak = 0;
    public state: PlayerState = PlayerState.IDLE;
    
    public attackIndex = 0;
    public attackSpeed = 1;

    public attackDashTimer?: number;
    public attackDashDuration?: number;
    public attackDashMaxSpeed = 3;

    public knockbackReceivedVector?: { x: number; y: number };
    public knockbackTimer?: number;

    constructor(
        id: string,
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        playerCollisionHandler: IEntityCollisionHandler
    ) {
        super(id, position, { dx: 0, dy: 0 }, 10, hp, hp, speed, false, EntityType.PLAYER, playerCollisionHandler);
        this.playerName = playerName;
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
        this.mouseDirection = info.mouseDirection;
        this.knockbackReceivedVector = info.knockbackReceivedVector;
        this.movingDirection = info.movingDirection;
        this.isDead = info.isDead;
        this.playerName = info.name;
        this.id = info.id;
        this.state = info.state;
        this.killCounter = info.killCounter;
        this.killStreak = info.killStreak;
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
            speed: this.speed,
            attackDashDuration: this.attackDashDuration,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            attackDashTimer: this.attackDashTimer,
            attackIndex: this.attackIndex,
            mouseDirection: this.mouseDirection,
            knockbackReceivedVector: this.knockbackReceivedVector,
            movingDirection: this.movingDirection,
            isDead: this.isDead,
            name: this.playerName,
            id: this.id,
            state: this.state,
            killCounter: this.killCounter,
            killStreak: this.killStreak,
            weapon: this.weapon.name,
            movingVector: this.movingVector,
            attackSpeed: this.attackSpeed,
            radius: this.radius,
            currentXp: this.currentXp,
            lvlXp: this.lvlXp,
            currentLvl: this.currentLvl,
        };
    }

    
}
