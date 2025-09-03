import { AttackHitboxService } from "./AttackHitboxService";
import { NetworkClient } from "../network/NetworkClient";
import { CoordinateService } from "./CoordinateService";
import { InputHandler } from "./InputHandler";
import type Player from "../../../shared/Player";
import { Action } from "../../../shared/Action";
import DashHelper from "../helper/DashHelper";
export const ATTACK_SEQUENCE = ["ATTACK_1", "ATTACK_2"];
const ATTACK_COOLDOWN = 10;
const ATTACK_RESET = 60;
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

  
        const len = Math.sqrt(dx * dx + dy * dy);

        // Direction du dash
        player.dashDir = { x: dx / len, y: dy / len };

        // Paramètres du dash
        player.dashTimer = player.dashDuration;    


        player.pendingAttackDir = dir;
        player.pendingAttack = true;
        
        this.network.dash({x:player.position.x, y:player.position.y}, DashHelper.getDashActionByVector(player.dashDir))

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
