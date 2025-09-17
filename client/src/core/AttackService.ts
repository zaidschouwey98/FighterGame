import { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";
import {  ATTACK_RESET, DASH_ATTACK_DURATION } from "../constantes";
import type { AttackData } from "../../../shared/AttackData";
import AnimHelper from "../helper/AnimHelper";
import { Direction } from "../../../shared/Direction";

export class AttackService {
    private attackResetTimer = ATTACK_RESET;
    private attackCooldownTimer = 0;

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
        if (player.weapon.attackCurrentCombo > 0) {
            this.attackResetTimer -= delta;
            if (this.attackResetTimer <= 0) {
                player.weapon.resetCombo();
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
        player.movingDirection = AnimHelper.getDirectionByVector(player.mouseDirection, [Direction.BOTTOM,Direction.TOP, Direction.LEFT, Direction.RIGHT]);
        this.attackCooldownTimer = player.weapon.attackCoolDown;
        this.attackResetTimer = ATTACK_RESET;
        // Notifier les autres systèmes
    }

    /** Crée une hitbox d'attaque */
    public performAttack(player: Player): AttackData | undefined {
        this.attackResetTimer = ATTACK_RESET;
        const mouse = this.input.getMousePosition();
        const world = this.coordinate.screenToWorld(mouse.x, mouse.y);
        const dx = world.x - player.position.x;
        const dy = world.y - player.position.y;
        const dir = Math.atan2(dy, dx);
        player.mouseDirection = {x:dx, y:dy}
        let res = player.weapon.useWeapon(player.position, dir);
        player.attackIndex = res.attackIndex;
        res.playerId = player.id;
        return res;
    }

    public isAttackReady() {
        return this.attackCooldownTimer <= 0;
    }
}
