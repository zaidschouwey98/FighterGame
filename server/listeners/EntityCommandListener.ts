import { Direction } from "../../shared/enums/Direction";
import { EntityInfo } from "../../shared/messages/EntityInfo";
import { EntityState } from "../../shared/messages/EntityState";
import Position from "../../shared/Position";
import { EntityCommand, EntityEvent, EventBus } from "../../shared/services/EventBus";
import { AttackDataBase } from "../../shared/types/AttackData";
import { ServerState } from "../ServerState";
import { AttackSystem } from "../systems/AttackSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { UpdateSystem } from "../systems/UpdateSystem";

export class EntityCommandListener {
    constructor(
        eventBus: EventBus,
        attackSystem: AttackSystem,
        movementSystem: MovementSystem,
        directionSystem: DirectionSystem,
        updateSystem: UpdateSystem,
        serverState: ServerState,
    ) {
        eventBus.on(EntityCommand.UPDATED, (data: EntityInfo) => {
            updateSystem.handleEntityUpdated(data);
        })

        eventBus.on(EntityCommand.ATTACK, (data: { entityId: string; attackData: AttackDataBase; }) => {
            attackSystem.handleAttack(data.attackData);
        })

        eventBus.on(EntityCommand.POSITION_UPDATED, (data: { entityId: string; position: Position; }) => {
            movementSystem.handlePosUpdated(data.entityId, data.position);
        });

        eventBus.on(EntityCommand.MOVING_VECTOR_CHANGED, (data: { entityId: string; movingVector: { dx: number; dy: number; }; state: EntityState; movingDirection: Direction; }) => {
            directionSystem.handleDirectionUpdate(data.entityId, data.movingVector, data.movingDirection, data.state)
        })
    }
}