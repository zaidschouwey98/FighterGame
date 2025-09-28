import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { DASH_ATTACK_DURATION } from "../../constantes";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EventBus, EventBusMessage } from "../../services/EventBus";

export class AttackDashState extends BaseState {
    readonly name = EntityState.ATTACK_DASH;

    private dashDuration = DASH_ATTACK_DURATION;
    private dashTimer = 0;

    constructor(
        entity: IStatefulEntity,
        private eventBus: EventBus,
        private inputHandler: IInputHandler
    ) {
        super(entity);
    }

    enter() {
        const world = this.inputHandler.getMousePosition();
        const dx = world.x - this.entity.position.x;
        const dy = world.y - this.entity.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        this.entity.aimVector = { x: dx / len, y: dy / len };
        this.dashTimer = this.dashDuration;

        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        if (this.dashTimer <= 0) {
            this.entity.changeState(EntityState.IDLE);
            return;
        }
        // Déplacement dash
        // Progression totale du dash (0 → 1)
        const t = 1 - this.dashTimer / this.dashDuration;

        // Fonction mathématique     avec freeze
        const freezeRatio = 10 / DASH_ATTACK_DURATION; // 15 premières frames sans mouvement
        const p = 9; // contrôle la douceur
        let speedFactor = 0;

        if (t >= freezeRatio) {
            const tPrime = (t - freezeRatio) / (1 - freezeRatio);
            speedFactor = Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
        }

        const speed = 4 * speedFactor; // Todo 4 = entity.attackDashMAxSpeed

        // Déplacement
        this.entity.position.x += this.entity.aimVector.x * speed;
        this.entity.position.y += this.entity.aimVector.y * speed;

        this.dashTimer -= delta;
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.entity.toInfo());

    }

    exit() {
        this.dashTimer = 0;

    }
}
