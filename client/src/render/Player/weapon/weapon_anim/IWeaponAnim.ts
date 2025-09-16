import type { Direction } from "../../../../../../shared/Direction";

export interface IWeaponAnim {

  play():void;

  stop():void;

  update(delta:number):void;

  isVisible?(): boolean;

  setDirection(dir:Direction):void;
}
