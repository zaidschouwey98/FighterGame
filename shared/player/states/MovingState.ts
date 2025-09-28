import { Direction } from "../../enums/Direction";
import { EntityState } from "../../messages/EntityState";
import type { IInputHandler } from "../../../client/src/core/IInputHandler";
import { MovementService } from "../../services/MovementService";
import { BaseState } from "./BaseState";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EntityEvent, EventBus, LocalPlayerEvent } from "../../services/EventBus";
import PlayerInfo from "../../messages/PlayerInfo";

export class MovingState extends BaseState {
  readonly name = EntityState.MOVING;
  private lastDx:number;
  private lastDy:number;
  constructor(
    entity: IStatefulEntity,
    private inputHandler:IInputHandler,
    private movementService: MovementService,
    private eventBus: EventBus
  ) {
    super(entity);
    this.lastDx = 0;
    this.lastDy = 0;
  }

  public enter() {
    this.eventBus.emit(EntityEvent.STATE_CHANGED, { entityId: this.entity.id, state:this.entity.currentState.name });
  }

  public update(delta: number) {
    const { dx, dy } = this.movementService.getMovementDelta();

    if (dx === 0 && dy === 0) {
      this.entity.changeState(EntityState.IDLE);
      return;
    }
    if (this.inputHandler.consumeAttack()) {
      this.entity.changeState(EntityState.ATTACK);
      return;
    }

    if (this.inputHandler.consumeRightClick()) {
      this.entity.changeState(EntityState.BLOCKING);
      return;
    }

    if (this.inputHandler.isSpaceDown()) {
      this.entity.changeState(EntityState.TELEPORTING);
      return;
    }

    if(this.inputHandler.consumeShift()){
      this.entity.changeState(EntityState.ATTACK_DASH);
      return;
    }

    // Déplacement
    MovementService.moveEntity(this.entity, delta);

    // Direction
    if (dy < 0) this.entity.movingDirection = Direction.TOP;
    if (dy > 0) this.entity.movingDirection = Direction.BOTTOM;
    if (dx < 0) this.entity.movingDirection = Direction.LEFT;
    if (dx > 0) this.entity.movingDirection = Direction.RIGHT;
    this.eventBus.emit(LocalPlayerEvent.MOVING, this.entity.toInfo() as PlayerInfo);

    if (dx !== this.lastDx || dy !== this.lastDy) {
      this.entity.movingVector = {dx:dx,dy:dy};
      this.eventBus.emit(EntityEvent.DIRECTION_CHANGED, { entityId: this.entity.id, direction: this.entity.movingVector });

      this.lastDx = dx;
      this.lastDy = dy;
    }
  }

  public exit() { 
    this.entity.movingVector = {dx:0,dy:0};
    this.lastDx = 0;
    this.lastDy = 0;
    this.eventBus.emit(EntityEvent.DIRECTION_CHANGED, { entityId: this.entity.id, direction: this.entity.movingVector });

  }
}
