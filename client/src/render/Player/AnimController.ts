// anim/AnimController.ts
import type PlayerInfo from "../../../../shared/PlayerInfo";
import { PlayerState } from "../../../../shared/PlayerState";
import type { IAnimState } from "./IAnimState";

export class AnimController {
  private currentLogical?: PlayerState; 
  private currentAnim?: IAnimState; 

  /**
   * @param registry  table qui mappe un PlayerState -> instance(s) d’état (IdleAnim, MovingAnim, Attack[], etc.)
   * @param fallback  état de secours si non enregistré (par défaut: IDLE)
   */
  constructor(
    private registry: Partial<Record<PlayerState, IAnimState | IAnimState[]>>,
    private fallback: PlayerState = PlayerState.IDLE
  ) {}

  public update(player: PlayerInfo) {
    const logical = player.state;

    // Si l'état logique change OU si c'est une attaque (comboIndex peut changer à chaque coup)
    const needTransition =
      logical !== this.currentLogical ||
      logical === PlayerState.ATTACK;

    if (needTransition) {
      if (this.currentAnim) this.currentAnim.stop();

      const nextAnim = this.resolveAnim(logical, player.attackIndex) 
                    ?? this.resolveAnim(this.fallback, 0);

      this.currentAnim = nextAnim;
      this.currentLogical = logical;

      // enter (one-shot) si dispo
      if (this.currentAnim?.enter) {
        this.currentAnim.enter(player);
      }
    }

    // tick de l’état courant
    this.currentAnim?.play(player);
  }

  /** Choisit la bonne anim (supporte tableau pour combos) */
  private resolveAnim(state: PlayerState, comboIndex: number): IAnimState | undefined {
    const anim = this.registry[state];
    if (Array.isArray(anim)) {
      return anim[comboIndex % anim.length];
    }
    return anim;
  }

  /** Permet d’enregistrer/écraser dynamiquement un état */
  public register(state: PlayerState, anim: IAnimState | IAnimState[]) {
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
