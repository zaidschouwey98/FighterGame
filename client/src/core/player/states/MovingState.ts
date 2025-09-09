import { Direction } from "../../../../../shared/Direction";
import { PlayerState } from "../../../../../shared/PlayerState";
import { EventBusMessage, type EventBus } from "../../EventBus";
import type { MovementService } from "../../MovementService";
import type Player from "../Player";
import { BaseState } from "./BaseState";

export class MovingState extends BaseState{
  readonly name = PlayerState.MOVING;

  constructor(
    player: Player,
    private movementService: MovementService,
    private eventBus: EventBus
  ) { 
    super(player);
  }

  public enter() {

  }

  public update(delta: number) {
    const { dx, dy } = this.movementService.getMovementDelta();

    if (dx === 0 && dy === 0) {
      this.player.changeState(this.player.idleState);
      this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
      return;
    }

    // Déplacement
    this.movementService.movePlayer(this.player, dx, dy, delta);

    // Direction
    if (dy < 0) this.player.movingDirection = Direction.TOP;
    if (dy > 0) this.player.movingDirection = Direction.BOTTOM;
    if (dx < 0) this.player.movingDirection = Direction.LEFT;
    if (dx > 0) this.player.movingDirection = Direction.RIGHT;
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
  }

  public exit() { }
}
