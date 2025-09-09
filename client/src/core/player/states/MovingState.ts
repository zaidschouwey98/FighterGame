// core/player/states/MovingState.ts
import { BaseState } from "./BaseState";
import { PlayerState } from "../../../../../shared/PlayerState";

export class MovingState extends BaseState {
  readonly name = PlayerState.MOVING;

  update(delta: number) {
    // Logique de mouvement : appliquer velocity sur position
    this.player.position.x += this.player.velocity.x * delta;
    this.player.position.y += this.player.velocity.y * delta;
  }
}
