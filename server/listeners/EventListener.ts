import { Direction } from "../../shared/enums/Direction";
import { EntityInfo } from "../../shared/messages/EntityInfo";
import { EntityState } from "../../shared/messages/EntityState";
import Position from "../../shared/Position";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";
import { AttackDataBase } from "../../shared/types/AttackData";
import { ServerState } from "../ServerState";
import { AttackSystem } from "../systems/AttackSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { UpdateSystem } from "../systems/UpdateSystem";

export class EventListener {
    constructor(
        eventBus: EventBus,
        attackSystem: AttackSystem,
        movementSystem: MovementSystem,
        directionSystem: DirectionSystem,
        updateSystem: UpdateSystem,
        serverState: ServerState,
    ) {
        eventBus.on(EntityEvent.UPDATED, (data: EntityInfo) => {

        })

        eventBus.on(EntityEvent.ATTACK, (data: { entityId: string; attackData: AttackDataBase; }) => {
            // attackSystem.handleAttack(res.attackData,this.socket);
        })

        eventBus.on(EntityEvent.POSITION_UPDATED, (data: { entityId: string; position: Position; }) => {

        });

        eventBus.on(EntityEvent.MOVING_VECTOR_CHANGED, (data: { entityId: string; movingVector: { dx: number; dy: number; }; state: EntityState; movingDirection: Direction; }) => {

        })

        eventBus.on(EntityEvent.POSITION_UPDATED, (data: { entityId: string; position: Position; }) => {

        })
    }
}