// anim/AnimController.ts

import { PlayerState } from "../../../../shared/PlayerState";
import type Player from "../../core/player/Player";
import type { IAnimState } from "./anim/IAnimState";




export class AnimController {
  private currentLogical?: PlayerState; 
  private currentAnim?: IAnimState; 

  /**
   * @param registry  table qui mappe un PlayerState -> instance de ton état (IdleAnim, MovingAnim, etc.)
   * @param fallback  état de secours si non enregistré (par défaut: IDLE)
   */
  constructor(
    private registry: Partial<Record<PlayerState, IAnimState>>,
    private fallback: PlayerState = PlayerState.IDLE
  ) {}

  public update(player: Player) {
    const logical = player.getState();

    // Si l'état logique change -> transition visuelle
    if (logical !== this.currentLogical) {

      if (this.currentAnim) this.currentAnim.stop();

      const nextAnim =
        this.registry[logical] ??
        this.registry[this.fallback];

      this.currentAnim = nextAnim;
      this.currentLogical = logical;

      // enter (one-shot) si dispo (utile pour dash cloud, tp, etc.)
      if (this.currentAnim?.enter) {
        this.currentAnim.enter(player);
      }
    }

    // tick de l’état courant
    this.currentAnim?.play(player);
  }

  /** Permet d’enregistrer/écraser dynamiquement un état (Open/Closed friendly) */
  public register(state: PlayerState, anim: IAnimState) {
    this.registry[state] = anim;
  }

  /** Forcer l’arrêt (ex: destruction du sprite) */
  public stop() {
    if (this.currentAnim) {
      this.currentAnim.stop();
      this.currentAnim = undefined;
      this.currentLogical = undefined;
    }
  }
}
