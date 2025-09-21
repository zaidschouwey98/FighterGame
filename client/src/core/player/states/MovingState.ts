import { Direction } from "../../../../../shared/Direction";
import { PlayerState } from "../../../../../shared/PlayerState";
import { EventBusMessage, type EventBus } from "../../EventBus";
import type { IInputHandler } from "../../IInputHandler";
import type { MovementService } from "../../MovementService";
import type Player from "../Player";
import { BaseState } from "./BaseState";

export class MovingState extends BaseState {
  readonly name = PlayerState.MOVING;
  private lastDx:number;
  private lastDy:number;
  constructor(
    player: Player,
    private inputHandler:IInputHandler,
    private movementService: MovementService,
    private eventBus: EventBus
  ) {
    super(player);
    this.lastDx = 0;
    this.lastDy = 0;
  }

  public enter() {

  }

  public update(delta: number) {
    const { dx, dy } = this.movementService.getMovementDelta();

    if (dx === 0 && dy === 0) {
      this.player.changeState(this.player.idleState);
      return;
    }
    if (this.inputHandler.consumeAttack()) {
      this.player.changeState(this.player.attackState);
      return;
    }

    if (this.inputHandler.consumeRightClick()) {
      this.player.changeState(this.player.blockState);
      return;
    }

    if (this.inputHandler.consumeSpaceClick()) {
      this.player.changeState(this.player.teleportState);
      return;
    }
    // Déplacement
    this.movementService.movePlayer(this.player, dx, dy, delta);

    // Direction
    if (dy < 0) this.player.movingDirection = Direction.TOP;
    if (dy > 0) this.player.movingDirection = Direction.BOTTOM;
    if (dx < 0) this.player.movingDirection = Direction.LEFT;
    if (dx > 0) this.player.movingDirection = Direction.RIGHT;
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_MOVING, this.player.toInfo());
    if (dx !== this.lastDx || dy !== this.lastDy) {
      this.player.movingVector = {dx:dx,dy:dy};
      this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED, this.player.toInfo());

      this.lastDx = dx;
      this.lastDy = dy;
    }
  }

  public exit() { 
    this.player.movingVector = {dx:0,dy:0};
    this.lastDx = 0;
    this.lastDy = 0;
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED, this.player.toInfo());
  }
}
