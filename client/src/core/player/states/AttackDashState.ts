import { PlayerState } from "../../../../../shared/PlayerState";
import type Player from "../Player";
import type { AttackService } from "../../AttackService";
import { BaseState } from "./BaseState";
import { EventBusMessage, type EventBus } from "../../EventBus";

export class AttackDashState extends BaseState {
    readonly name = PlayerState.ATTACK_DASH;

    constructor(player: Player, private attackService: AttackService, private eventBus:EventBus) {
        super(player);
    }

    enter() {
        this.attackService.initiateAttack(this.player);
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED,this.player.toInfo());
    }

    update(delta: number) {
        if (this.player.attackDashTimer == undefined || this.player.attackDashTimer <= 0) {
            this.player.attackDashTimer = undefined;
            this.player.changeState(this.player.attack1State);
            return;
        }
        // Déplacement dash
        if (!this.player.attackDashTimer || this.player.attackDashTimer <= 0) return;

        // Progression totale du dash (0 → 1)
        const t = 1 - this.player.attackDashTimer / this.player.attackDashDuration!;

        // Fonction mathématique     avec freeze
        const freezeRatio = 10 / this.player.attackDashDuration!; // 15 premières frames sans mouvement
        const p = 9; // contrôle la douceur
        let speedFactor = 0;

        if (t >= freezeRatio) {
            const tPrime = (t - freezeRatio) / (1 - freezeRatio);
            speedFactor = Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
        }

        const speed = this.player.attackDashMaxSpeed * speedFactor;

        // Déplacement
        this.player.position.x += this.player.mouseDirection.x * speed;
        this.player.position.y += this.player.mouseDirection.y * speed;
        this.player.attackDashTimer -= delta;
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED,this.player.toInfo());
    }

    exit() {
        this.player.attackDashTimer = undefined;
    }
}
