import { EntityState } from "../../messages/EntityState";
import type { Player } from "../../entities/Player";
import type { AttackService } from "../../services/AttackService";
import { BaseState } from "./BaseState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { ClientPlayer } from "../../entities/ClientPlayer";
import { ATTACK_DASH_COOLDOWN, DASH_ATTACK_DURATION } from "../../constantes";
import DirectionHelper from "../../DirectionHelper";
import { Direction } from "../../enums/Direction";

export class AttackDashState extends BaseState {
    readonly name = EntityState.ATTACK_DASH;

    constructor(player: ClientPlayer, private eventBus: EventBus, private inputHandler: IInputHandler) {
        super(player);
    }

    // canEnter(): boolean {
        
    // }

    enter() {
        const world = this.inputHandler.getMousePosition();
        const dx = world.x - this.player.position.x;
        const dy = world.y - this.player.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        // Vecteur du dash
        this.player.mouseDirection = { x: dx / len, y: dy / len };
        this.player.attackDashDuration = DASH_ATTACK_DURATION;
        this.player.attackDashTimer = DASH_ATTACK_DURATION;
        this.player.movingDirection = DirectionHelper.getDirectionByVector(this.player.mouseDirection, [Direction.BOTTOM, Direction.TOP, Direction.LEFT, Direction.RIGHT]);
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    update(delta: number) {

        if (this.player.attackDashTimer == undefined || this.player.attackDashTimer <= 0) {
            if(this.inputHandler.consumeAttack()){
                
                this.player.changeState(this.player.attackState);
                return;
            }
            this.player.changeState(this.player.idleState);
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
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    }

    exit() {
        this.player.attackDashTimer = undefined;
    }
}
