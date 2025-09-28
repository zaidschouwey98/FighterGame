import { IInputHandler } from "../../../client/src/core/IInputHandler";
import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { Ability } from "../abilities/Ability";
import { AbilityType } from "../../enums/AbilityType";
import { EntityEvent, EventBus } from "../../services/EventBus";

export class TeleportState extends BaseState {
    readonly name = EntityState.TELEPORTING;
    private timer = 150;
    private distance = 0;
    private readonly MAX_DISTANCE = 300;
    private ability?:Ability;

    constructor(
        entity: IStatefulEntity,
        private eventBus: EventBus,
        private inputHandler: IInputHandler
    ) {
        super(entity);
    }

    canEnter(): boolean {
        this.ability = this.entity.getAbility(AbilityType.TELEPORT);
        if(!this.ability) return false;
        return this.ability.canUse();
    }

    enter() {
        this.timer = 150;
        this.distance = 50; // distance de base (si juste tapé)
        this.eventBus.emit(EntityEvent.UPDATED, this.entity.toInfo());
    }

    update(delta: number) {
        this.timer -= delta;


        const world = this.inputHandler.getMousePosition();
        const dx = world.x - this.entity.position.x;
        const dy = world.y - this.entity.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        let tpVector = { x: 0, y: 0 };
        if (len > 0) {
            tpVector = { x: dx / len, y: dy / len };
        }

        if (this.inputHandler.isSpaceDown()) {
            this.distance += delta * 4; // ajuste la vitesse de "charge"
            if (this.distance > this.MAX_DISTANCE) {
                this.distance = this.MAX_DISTANCE;
            }
        } else {
            this.ability!.use(this.entity, tpVector, this.distance);
            return;
        }

        if (this.timer <= 0) {
            this.ability!.use(this.entity, tpVector, this.distance);
            return;
        }

        // this.eventBus.emit(EventBusMessage.TELEPORT_DESTINATION_HELPER, new Position(this.entity.position.x + tpVector.x * this.distance, this.entity.position.y + tpVector.y * this.distance));
    }
    exit() { }
}
