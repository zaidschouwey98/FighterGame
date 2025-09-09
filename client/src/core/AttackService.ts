import { AttackHitboxService } from "./AttackHitboxService";
import { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";
import { ATTACK_COOLDOWN, ATTACK_RESET, DASH_ATTACK_DURATION, KNOCKBACK_TIMER } from "../constantes";
import type { AttackData } from "../../../shared/AttackData";
import { GameState } from "./GameState";

export class AttackService {
    private attackResetTimer = ATTACK_RESET;
    private attackCooldownTimer = 0;
    private attackOnGoing = false;

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

    /** Prépare une attaque (dash inclus) */
    public initiateAttack(player: Player) {
        if (!this.isAttackReady()) return;

        this.attackOnGoing = true;

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

    /** Crée une hitbox d'attaque et notifie le serveur */
    public performAttack(player: Player): AttackData | undefined {
        if (!this.attackOnGoing) return;

        const mouse = this.input.getMousePosition();
        const world = this.coordinate.screenToWorld(mouse.x, mouse.y);
        const dx = world.x - player.position.x;
        const dy = world.y - player.position.y;
        const dir = Math.atan2(dy, dx);

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
        this.attackOnGoing = false;

        return res;
    }

    /** Gestion du knockback si blocage */
    public attackGotBlocked(attacker: Player, blockerId: string, knockback: number) {
        const blocker = GameState.instance.players.get(blockerId);
        if (!blocker) return;

        this.attackCooldownTimer = ATTACK_COOLDOWN;
        const dx = attacker.position.x - blocker.position.x;
        const dy = attacker.position.y - blocker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        attacker.knockbackReceivedVector = {
            x: (dx / len) * knockback * 2,
            y: (dy / len) * knockback * 2
        };
        attacker.knockbackTimer = KNOCKBACK_TIMER * 2;
    }

    public isAttackReady() {
        return this.attackCooldownTimer <= 0 && !this.attackOnGoing;
    }
}
