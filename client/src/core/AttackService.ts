import { AttackHitboxService } from "./AttackHitboxService";
import { NetworkClient } from "../network/NetworkClient";
import { CoordinateService } from "./CoordinateService";
import { InputHandler } from "./InputHandler";
import type Player from "../../../shared/Player";
import { Action } from "../../../shared/Action";
import DashHelper from "../helper/DashHelper";
import { GameState } from "./GameState";
import { ATTACK_COOLDOWN, ATTACK_RESET, ATTACK_SEQUENCE, KNOCKBACK_TIMER } from "../constantes";

export class AttackService {
    private attackResetTimer: number = ATTACK_RESET;
    private attackCoolDownTimer: number = ATTACK_COOLDOWN;
    private isAttackReady: boolean = true;
    private _attackOnGoing: boolean = false;

    constructor(
        private inputHandler: InputHandler,
        private coordinateService: CoordinateService,
        private network: NetworkClient
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
        let dir = Math.atan2(dy, dx);
        const len = Math.sqrt(dx * dx + dy * dy);
        // Direction du dash
        player.dashDir = { x: dx / len, y: dy / len };
        // Paramètres du dash
        player.attackDashTimer = player.attackDashDuration;
        player.pendingAttackDir = dir;
        player.pendingAttack = true;
        player.currentAction = DashHelper.getDashActionByVector(player.dashDir)
        this.network.dash({ x: player.position.x, y: player.position.y }, DashHelper.getDashActionByVector(player.dashDir))

        this.isAttackReady = false;
        this.attackCoolDownTimer = ATTACK_COOLDOWN;
        this.attackResetTimer = ATTACK_RESET;
    }


    public performAttack(player: Player, dir: number) {
        if (!this._attackOnGoing)
            return;
        player.currentAction = ATTACK_SEQUENCE[player.attackIndex] as Action;
        const hitbox = AttackHitboxService.createHitbox(player.position, dir);

        this.network.attack({
            playerId: player.id,
            knockbackStrength: 15, // TODO CHANGE WHEN CHANGING ATTACK
            position: { ...player.position },
            rotation: dir,
            hitbox,
            playerAction: player.currentAction
        });
        player.attackIndex = (player.attackIndex + 1) % ATTACK_SEQUENCE.length;
        player.currentAction = Action.IDLE_DOWN;
        this._attackOnGoing = false;

    }

    public attackGotBlocked(attacker: Player, blockerId:string, totalKnockbackStrength:number) {
        const blocker = GameState.instance.players.get(blockerId);
        if (!blocker) return;
        this.attackCoolDownTimer = ATTACK_COOLDOWN;
        const dx = attacker.position.x - blocker.position.x;
        const dy = attacker.position.y - blocker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;


        attacker.knockbackReceived = {
            x: (dx / len) * totalKnockbackStrength,
            y: (dy / len) * totalKnockbackStrength,
        };
        attacker.knockbackTimer = KNOCKBACK_TIMER / 2;
    }


    public get attackOngoing(): boolean {
        return this._attackOnGoing;
    }

}
