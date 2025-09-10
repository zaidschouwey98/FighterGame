import { AttackHitboxService } from "./AttackHitboxService";
import { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";
import { ATTACK_COOLDOWN, ATTACK_RESET, DASH_ATTACK_DURATION } from "../constantes";
import type { AttackData } from "../../../shared/AttackData";

export class AttackService {
    private attackResetTimer = ATTACK_RESET;
    private attackCooldownTimer = 0;
    public attackOnGoing = false;

    constructor(
        private input: InputHandler,
        private coordinate: CoordinateService,
    ) { }

    /** Appelée chaque frame pour gérer cooldown et reset combo */
    public update(delta: number, player: Player) {
        // Cooldown
        if (this.attackCooldownTimer > 0) {
            this.attackCooldownTimer -= delta;
        }

        // Reset combo
        if (player.attackIndex > 0) {
            this.attackResetTimer -= delta;
            if (this.attackResetTimer <= 0) {
                player.attackIndex = 0;
                this.attackResetTimer = ATTACK_RESET;
            }
        }
    }

    /** Prépare une attaque (dash) */
    public initiateAttack(player: Player) {
        const mouse = this.input.getMousePosition();
        const world = this.coordinate.screenToWorld(mouse.x, mouse.y);
        const dx = world.x - player.position.x;
        const dy = world.y - player.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        // Vecteur du dash
        player.mouseDirection = { x: dx / len, y: dy / len };
        player.attackDashDuration = DASH_ATTACK_DURATION;
        player.attackDashTimer = DASH_ATTACK_DURATION;

        this.attackCooldownTimer = ATTACK_COOLDOWN;
        this.attackResetTimer = ATTACK_RESET;
        // Notifier les autres systèmes
    }

    /** Crée une hitbox d'attaque */
    public performAttack(player: Player): AttackData | undefined {

        const mouse = this.input.getMousePosition();
        const world = this.coordinate.screenToWorld(mouse.x, mouse.y);
        const dx = world.x - player.position.x;
        const dy = world.y - player.position.y;
        const dir = Math.atan2(dy, dx);
        // player.mouseDirection = {x:dx,y:dy}
        const hitbox = AttackHitboxService.createHitbox(player.position, dir);
        let res = {
            playerId: player.id,
            position: { ...player.position },
            rotation: dir,
            knockbackStrength: 15, // TODO: constante/configurable
            hitbox,
            playerAction: player.state
        } as AttackData;

        player.attackIndex = (player.attackIndex + 1) % 3; // Combo cycle
        return res;
    }

    public isAttackReady() {
        return this.attackCooldownTimer <= 0;
    }
}
