import Position from "../Position";
import { IdleState } from "../player/states/IdleState";
import { MovingState } from "../player/states/MovingState";
import type { EventBus } from "../services/EventBus";
import { MovementService } from "../services/MovementService";
import { AttackDashState } from "../player/states/AttackDashState";
import { AttackState } from "../player/states/AttackState";
import { HitState } from "../player/states/HitState";
import { DieState } from "../player/states/DieState";
import { BlockState } from "../player/states/BlockState";
import { KnockBackState } from "../player/states/KnockBackState";
import { TeleportState } from "../player/states/TeleportState";
import type { AttackReceivedData, KnockbackData } from "../types/AttackResult";
import type { IInputHandler } from "../../client/src/core/IInputHandler";
import { ClientPlayerCollisionHandler } from "../player/ClientPlayerCollisionHandler";
import { LivingEntity } from "./LivingEntity";
import PlayerInfo from "../messages/PlayerInfo";
import { EntityType } from "../enums/EntityType";
import { EntityState } from "../messages/EntityState";
import { AttackAbility, BlockAbility, TeleportAbility } from "../player/abilities/Abilities";
import { AbilityType } from "../enums/AbilityType";
import { TeleportedState } from "../player/states/TeleportedState";
import { Weapon } from "../player/weapons/Weapon";

export class ClientPlayer extends LivingEntity {
    public name?: string;
    
    public currentXp = 0;
    public lvlXp = 100;
    public currentLvl = 1;
    
    public killCounter = 0;
    public killStreak = 0;

    public attackDashTimer?: number;
    public attackDashDuration?: number;
    public attackDashMaxSpeed = 4.5;

    public knockbackReceivedVector?: { x: number; y: number };

    private movementService: MovementService;

    constructor(
        id: string,
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        baseWeapon: Weapon,
        eventBus: EventBus,
        private inputHandler: IInputHandler,
    ) {
        super(id, position, 10, hp, hp, 0.10, 10, EntityType.PLAYER, new ClientPlayerCollisionHandler(), baseWeapon);
        this.name = playerName;
        this.speed = speed;

        this.movementService = new MovementService(inputHandler);
        const baseState = new IdleState(this, inputHandler, eventBus)
        this.addState(baseState);
        this.addState(new MovingState(this, inputHandler, this.movementService, eventBus));
        this.addState(new AttackDashState(this, eventBus, inputHandler));
        this.addState(new AttackState(this, this.movementService, eventBus, inputHandler));
        this.addState(new DieState(this, eventBus));
        this.addState(new BlockState(this, eventBus, inputHandler));
        this.addState(new TeleportState(this, eventBus, inputHandler));
        this.addState(new HitState(this, eventBus, inputHandler));
        this.addState(new KnockBackState(this, eventBus, inputHandler));
        this.addState(new TeleportedState(this, eventBus));

        this.currentState = baseState;
        
        this.addAbility(AbilityType.ATTACK,new AttackAbility(eventBus));
        this.addAbility(AbilityType.TELEPORT,new TeleportAbility(eventBus));
        this.addAbility(AbilityType.BLOCK,new BlockAbility(eventBus));

    }

    public update(delta: number): void {
        if(!this.currentState) return;
        super.update(delta);
        this.inputHandler.update();
    }

    public handleAttackReceived(attackReceivedData: AttackReceivedData) {
        this.movingVector = { dx: 0, dy: 0 };
        this.hp = attackReceivedData.newHp;
        this.knockbackReceivedVector = { x: attackReceivedData.knockbackData.knockbackVector.dx, y: attackReceivedData.knockbackData.knockbackVector.dy };
        this.changeState(EntityState.HIT,{ vector: attackReceivedData.knockbackData.knockbackVector, duration: attackReceivedData.knockbackData.knockbackTimer });
    }

    public handleKnockbackReceived(knockbackData: KnockbackData) {
        this.movingVector = { dx: 0, dy: 0 };
        this.knockbackReceivedVector = { x: knockbackData.knockbackVector.dx, y: knockbackData.knockbackVector.dy };
        this.changeState(EntityState.KNOCKBACK,{ vector: knockbackData.knockbackVector, duration: knockbackData.knockbackTimer });
    }

    

    public respawn(position: Position) {
        throw new Error("Method not implemented.");
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
