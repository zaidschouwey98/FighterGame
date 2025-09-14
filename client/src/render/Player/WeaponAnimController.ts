import { PlayerState } from "../../../../shared/PlayerState";
import type { IWeaponAnim } from "./weapon_anim/IWeaponAnim";

export class WeaponAnimController {
  private current: IWeaponAnim | undefined = undefined;
  private currentState: PlayerState = PlayerState.IDLE;
  constructor(private animations: Partial<Record<PlayerState, IWeaponAnim>>) {}

  setState(state: PlayerState) {
    if(this.currentState == state)
        return;
    this.currentState = state;
    this.current?.stop();
    const anim = this.animations[state];
    this.current = anim;
    anim?.play();
  }

  update(delta:number) {
    this.current?.update(delta);
  }

  isVisible(): boolean {
    return this.current?.isVisible?.() ?? true;
  }
}
