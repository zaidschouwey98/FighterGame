import { AttackHitboxService } from "./AttackHitboxService";
import { CoordinateService } from "./CoordinateService";
import { InputHandler } from "./InputHandler";
import type Player from "./player/Player";
import { PlayerState } from "../../../shared/PlayerState";
import { GameState } from "./GameState";
import { ATTACK_COOLDOWN, ATTACK_RESET, ATTACK_SEQUENCE, DASH_ATTACK_DURATION, KNOCKBACK_TIMER } from "../constantes";
import { EventBusMessage, type EventBus } from "./EventBus";
import type { AttackData } from "../../../shared/AttackData";

export class AttackService {
    private attackResetTimer: number = ATTACK_RESET;
    private attackCoolDownTimer: number = ATTACK_COOLDOWN;
    private isAttackReady: boolean = true;
    private _attackOnGoing: boolean = false;

    constructor(
        private inputHandler: InputHandler,
        private coordinateService: CoordinateService,
        private eventBus: EventBus,
    ) { }

    public update(delta: number, player: Player) {
        if (this.attackCoolDownTimer > 0) {
            this.attackCoolDownTimer -= delta;
            if (this.attackCoolDownTimer <= 0) {
                this.isAttackReady = true;
            }
        }

        if (player.attackIndex > 0) {
            this.attackResetTimer -= delta;
            if (this.attackResetTimer <= 0) {
                player.attackIndex = 0;
                this.attackResetTimer = ATTACK_RESET;
            }
        }
    }

    public stopAttack() {
        if (this._attackOnGoing) {
            this._attackOnGoing = false;
            this.isAttackReady = true;
        }
    }

    public initiateAttack(player: Player) {
        if (!this.isAttackReady) return;
        this._attackOnGoing = true;
        const mousePos = this.inputHandler.getMousePosition();
        const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
        const dx = worldMousePos.x - player.position.x;
        const dy = worldMousePos.y - player.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        // Direction du dash
        player.mouseDirection = { x: dx / len, y: dy / len };
        // Paramètres du dash
        player.attackDashDuration = DASH_ATTACK_DURATION;
        player.attackDashTimer = player.attackDashDuration;
        player.setState(PlayerState.ATTACK_DASH);
        this.isAttackReady = false;
        this.attackCoolDownTimer = ATTACK_COOLDOWN;
        this.attackResetTimer = ATTACK_RESET;
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, player.toInfo());
    }


    public performAttack(player: Player) {
        if (!this._attackOnGoing)
            return;
        player.setState(ATTACK_SEQUENCE[player.attackIndex] as PlayerState);

        //// remove if too overpowered
        const mousePos = this.inputHandler.getMousePosition();
        const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
        const dx = worldMousePos.x - player.position.x;
        const dy = worldMousePos.y - player.position.y;
        let dir = Math.atan2(dy, dx);
        ////
        const hitbox = AttackHitboxService.createHitbox(player.position, dir);

        this.eventBus.emit(EventBusMessage.LOCAL_ATTACK_PERFORMED, {
            playerId: player.id,
            position: {...player.position},
            rotation: dir,
            knockbackStrength: 15,// TODO: constante/configurable
            hitbox: hitbox,
            playerAction: player.getState()

        } as AttackData);
        player.attackIndex = (player.attackIndex + 1) % ATTACK_SEQUENCE.length;
        this._attackOnGoing = false;
    }

    public attackGotBlocked(attacker: Player, blockerId: string, totalKnockbackStrength: number) {
        const blocker = GameState.instance.players.get(blockerId);
        if (!blocker) return;
        this.attackCoolDownTimer = ATTACK_COOLDOWN;
        const dx = attacker.position.x - blocker.position.x;
        const dy = attacker.position.y - blocker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        attacker.knockbackReceivedVector = {
            x: (dx / len) * totalKnockbackStrength * 2,
            y: (dy / len) * totalKnockbackStrength * 2,
        };
        attacker.knockbackTimer = KNOCKBACK_TIMER * 2;
    }


    public get attackOngoing(): boolean {
        return this._attackOnGoing;
    }

}
