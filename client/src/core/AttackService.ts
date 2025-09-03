import { AttackHitboxService } from "./AttackHitboxService";
import { NetworkClient } from "../network/NetworkClient";
import { CoordinateService } from "./CoordinateService";
import { InputHandler } from "./InputHandler";
import type Player from "../../../shared/Player";
import { Action } from "../../../shared/Action";
export const ATTACK_SEQUENCE = ["ATTACK_1", "ATTACK_2"];
const ATTACK_COOLDOWN = 20;
const ATTACK_RESET = 60;
const DASH_DISTANCE = 40;
export class AttackService {
    private attackResetTimer: number = ATTACK_RESET;
    private attackCoolDownTimer: number = ATTACK_COOLDOWN;
    private isAttackReady: boolean = true;

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

    public initiateAttack(player: Player) {
        if (!this.isAttackReady) return;

        const mousePos = this.inputHandler.getMousePosition();
        const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
        const dx = worldMousePos.x - player.position.x;
        const dy = worldMousePos.y - player.position.y;
        let dir = Math.atan2(dy, dx);

        const dashDistance = DASH_DISTANCE;
        const dashFrames = 14;

        // Stocker la position de départ pour le dash
        player.dashPositionStart = { ...player.position };

        player.dashVelocity = {
            x: Math.cos(dir) * dashDistance,
            y: Math.sin(dir) * dashDistance
        };
        player.dashTimer = dashFrames;
        player.pendingAttackDir = dir;
        player.pendingAttack = true;

        this.isAttackReady = false;
        this.attackCoolDownTimer = ATTACK_COOLDOWN;
        this.attackResetTimer = ATTACK_RESET;
    }


    public performAttack(player: Player, dir: number) {
        player.currentAction = ATTACK_SEQUENCE[player.attackIndex] as Action;
        const hitbox = AttackHitboxService.createHitbox(player.position, dir);

        this.network.attack({
            playerId: player.id,
            position: { ...player.position },
            rotation: dir,
            hitbox,
            playerAction: player.currentAction
        });
        player.attackIndex = (player.attackIndex + 1) % ATTACK_SEQUENCE.length;
    }
}
