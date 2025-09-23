import type { Direction } from "../../../../../../shared/Direction";
import type PlayerInfo from "../../../../../../shared/PlayerInfo";
import { PlayerState } from "../../../../../../shared/PlayerState";
import type { IWeaponAnim } from "./IWeaponAnim";

export class WeaponAnimController {
  private current?: IWeaponAnim;
  private currentState: PlayerState = PlayerState.IDLE;

  constructor(
    private animations: Partial<Record<PlayerState, IWeaponAnim | IWeaponAnim[]>>
  ) { }

  setState(playerInfo:PlayerInfo) {
    const needTransition =
      playerInfo.state !== this.currentState || playerInfo.state === PlayerState.ATTACK;

    if (!needTransition) return;

    this.current?.stop();
    this.currentState = playerInfo.state;

    this.current = this.resolveAnim(playerInfo.state, playerInfo.attackIndex);

    if (this.current) {
      this.current.play(playerInfo);
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
