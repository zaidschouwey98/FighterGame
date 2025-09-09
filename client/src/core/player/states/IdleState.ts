// core/player/states/IdleState.ts
import { BaseState } from "./BaseState";
import { PlayerState } from "../../../../../shared/PlayerState";

export class IdleState extends BaseState {
  readonly name = PlayerState.IDLE;

  enter() {

  }

  update(delta: number) {
    // On ne fait rien de spécial ici
  }
}
