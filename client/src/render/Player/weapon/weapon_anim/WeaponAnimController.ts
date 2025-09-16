import type { Direction } from "../../../../../../shared/Direction";
import { PlayerState } from "../../../../../../shared/PlayerState";
import type { IWeaponAnim } from "./IWeaponAnim";

export class WeaponAnimController {
  private current?: IWeaponAnim;
  private currentState: PlayerState = PlayerState.IDLE;

  constructor(
    private animations: Partial<Record<PlayerState, IWeaponAnim | IWeaponAnim[]>>
  ) {}

  setState(state: PlayerState, comboIndex = 0) {
    // si pas de changement d'état, sauf pour ATTACK (car comboIndex peut évoluer)
    const needTransition =
      state !== this.currentState || state === PlayerState.ATTACK;

    if (!needTransition) return;

    this.current?.stop();
    this.currentState = state;

    this.current = this.resolveAnim(state, comboIndex);
    this.current?.play();
  }

  setAttack(comboIndex: number) {
    if (this.currentState === PlayerState.ATTACK) {
      this.current?.stop();
      this.current = this.resolveAnim(PlayerState.ATTACK, comboIndex);
      this.current?.play();
    }
  }

  private resolveAnim(state: PlayerState, comboIndex: number): IWeaponAnim | undefined {
    const anim = this.animations[state];
    if (Array.isArray(anim)) {
      return anim[comboIndex % anim.length];
    }
    return anim;
  }

  setDirection(direction: Direction) {
    this.current?.setDirection(direction);
  }

  update(delta: number) {
    this.current?.update(delta);
  }

  isVisible(): boolean {
    return this.current?.isVisible?.() ?? true;
  }
}
