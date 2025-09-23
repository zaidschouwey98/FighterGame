import { Player } from "../player/Player";
import {  ATTACK_RESET, DASH_ATTACK_DURATION } from "../constantes";
import type { AttackData } from "../AttackData";
import DirectionHelper from "../DirectionHelper";
import { Direction } from "../Direction";
import type Position from "../Position";
import type { IInputHandler } from "../../client/src/core/IInputHandler";

export class AttackService {
    private attackResetTimer = ATTACK_RESET;
    private attackCooldownTimer = 0;

    constructor(
        private input: IInputHandler,
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
        const world = this.input.getMousePosition();
        const dx = world.x - player.position.x;
        const dy = world.y - player.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        // Vecteur du dash
        player.mouseDirection = { x: dx / len, y: dy / len };
        player.attackDashDuration = DASH_ATTACK_DURATION;
        player.attackDashTimer = DASH_ATTACK_DURATION;
        player.movingDirection = DirectionHelper.getDirectionByVector(player.mouseDirection, [Direction.BOTTOM,Direction.TOP, Direction.LEFT, Direction.RIGHT]);
        this.attackCooldownTimer = player.weapon.attackCoolDown(player.attackSpeed);
        this.attackResetTimer = ATTACK_RESET;
        // Notifier les autres systèmes
    }

    /** Crée une hitbox d'attaque */
    public performAttack(player: Player, attackDirection: {x:number, y:number}): AttackData | undefined {
        this.attackResetTimer = ATTACK_RESET;
        const dir = Math.atan2(attackDirection.y, attackDirection.x);
        let res = player.weapon.useWeapon(player.position, dir);
        res.playerId = player.id;
        return res;
    }

     public getAttackDir(playerPos: Position): {x:number,y:number} {
        const world = this.input.getMousePosition();
        const dx = world.x - playerPos.x;
        const dy = world.y - playerPos.y;
        return {x:dx, y:dy}
    }

    public isAttackReady() {
        return this.attackCooldownTimer <= 0;
    }
}
