import type { Direction } from "../../../../../../shared/enums/Direction";
import type PlayerInfo from "../../../../../../shared/messages/PlayerInfo";
import { EntityState } from "../../../../../../shared/messages/EntityState";
import type { IWeaponAnim } from "./IWeaponAnim";

export class WeaponAnimController {
  private current?: IWeaponAnim;
  private currentState: EntityState = EntityState.IDLE;

  constructor(
    private animations: Partial<Record<EntityState, IWeaponAnim | IWeaponAnim[]>>
  ) { }

  setState(playerInfo:PlayerInfo) {
    const needTransition =
      playerInfo.state !== this.currentState || playerInfo.state === EntityState.ATTACK;

    if (!needTransition) return;

    this.current?.stop();
    this.currentState = playerInfo.state;

    this.current = this.resolveAnim(playerInfo.state, playerInfo.attackIndex);

    if (this.current) {
      this.current.play(playerInfo);
    }
  }

  private resolveAnim(state: EntityState, comboIndex: number): IWeaponAnim | undefined {
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
