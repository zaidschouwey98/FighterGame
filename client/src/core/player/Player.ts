import { PlayerState } from "../../../../shared/PlayerState";
import type PlayerInfo from "../../../../shared/PlayerInfo";
import Position from "../../../../shared/Position";
import { FSM } from "./FSM";
import { Direction } from "../../../../shared/Direction";

// WHEN ADDING PROP, ENSURE TO ADD PROP IN PLAYERINFO AND IN toInfo() DOWN THERE
export default class Player {
    private fsm: FSM;

    public hp: number;
    public speed: number;
    public id: string;
    public playerName?: string;
    public isDead: boolean = false;
    public position: Position;
    public movingDirection: Direction = Direction.BOTTOM;
    public mouseDirection: { x: number, y: number } = {x:0, y:0};

    public attackIndex: number = 0;

    public blockTimer?: number;   // Frames restantes de block

    public attackDashTimer?: number; // durée restante du dash
    public attackDashDuration?: number; // durée en frames
    public attackDashMaxSpeed = 3; // TODO PUT THIS IN CONST

    public knockbackReceivedVector?: { x: number; y: number };
    public knockbackTimer?: number;

    constructor(
        playerName: string = "Unknown",
        position: Position,
        hp: number = 100,
        speed: number = 10,
        id: string
    ) {
        this.playerName = playerName
        this.id = id;
        this.position = new Position(position.x, position.y);
        this.hp = hp;
        this.speed = speed;
        this.fsm = new FSM(PlayerState.IDLE);

        this.fsm.allow(PlayerState.IDLE, PlayerState.ATTACK_DASH);
        this.fsm.allow(PlayerState.IDLE, PlayerState.KNOCKBACK);
        this.fsm.allow(PlayerState.IDLE, PlayerState.MOVING);
        this.fsm.allow(PlayerState.MOVING, PlayerState.IDLE);
        this.fsm.allow(PlayerState.IDLE, PlayerState.IDLE);
        this.fsm.allow(PlayerState.MOVING, PlayerState.MOVING);
        this.fsm.allow(PlayerState.ATTACK_DASH, PlayerState.IDLE);
        this.fsm.allow(PlayerState.IDLE, PlayerState.BLOCKING);
        this.fsm.allow(PlayerState.BLOCKING, PlayerState.IDLE);
        this.fsm.allow(PlayerState.ANY, PlayerState.DEAD);
        // hooks (exemple)
        // this.fsm.addEnterHook(PlayerState.ATTACK_DASH, () => {
        //     console.log("Player starts dash");
        // });
    }

    public setState(state: PlayerState) {
        this.fsm.tryTransition(state);
    }

    public getState(): PlayerState {
        return this.fsm.state;
    }


    public static fromInfo(info: PlayerInfo): Player {
        const player = new Player(
            info.name ?? "Unknown",
            info.position,
            info.hp,
            info.speed,
            info.id
        );

        player.attackDashDuration = info.attackDashDuration;
        player.attackDashMaxSpeed = info.attackDashMaxSpeed;
        player.attackDashTimer = info.attackDashTimer;
        player.attackIndex = info.attackIndex;
        player.blockTimer = info.blockTimer;
        player.mouseDirection = info.mouseDirection;
        player.knockbackReceivedVector = info.knockbackReceivedVector;
        player.knockbackTimer = info.knockbackTimer;
        player.isDead = info.isDead;
        player.movingDirection = info.movingDirection;
        player.setState(info.state);

        return player;
    }

    public updateFromInfo(info: PlayerInfo) {
        this.position = info.position;
        this.hp = info.hp;
        this.speed = info.speed;
        this.attackDashDuration = info.attackDashDuration;
        this.attackDashMaxSpeed = info.attackDashMaxSpeed;
        this.attackDashTimer = info.attackDashTimer;
        this.attackIndex = info.attackIndex;
        this.blockTimer = info.blockTimer;
        this.knockbackReceivedVector = info.knockbackReceivedVector;
        this.knockbackTimer = info.knockbackTimer;
        this.mouseDirection = info.mouseDirection;
        this.movingDirection = info.movingDirection;

        this.isDead = info.isDead;
        this.setState(info.state);
    }

    public toInfo(): PlayerInfo {
        return {
            position: this.position,
            hp: this.hp,
            speed: this.speed,
            attackDashDuration: this.attackDashDuration,
            attackDashMaxSpeed: this.attackDashMaxSpeed,
            attackDashTimer: this.attackDashTimer,
            attackIndex: this.attackIndex,
            blockTimer: this.blockTimer,
            mouseDirection: this.mouseDirection,
            knockbackReceivedVector: this.knockbackReceivedVector,
            knockbackTimer: this.knockbackTimer,
            movingDirection: this.movingDirection,
            isDead: this.isDead,
            id: this.id,
            state: this.getState(),
        };
    }
}