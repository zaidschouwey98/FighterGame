// core/player/states/BaseState.ts
import type Player from "../Player";
import { PlayerState } from "../../../../../shared/PlayerState";

export abstract class BaseState {
  constructor(protected player: Player) {}

  abstract readonly name: PlayerState;

  canEnter(): boolean {return true}; 
  enter(): void {}    // appelé quand on entre dans l'état
  exit(): void {}     // appelé quand on sort de l'état
  update(_delta: number): void {} // logique de mise à jour
}
