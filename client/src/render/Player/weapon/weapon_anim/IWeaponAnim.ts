import type { Direction } from "../../../../../../shared/Direction";

export interface IWeaponAnim {

  play(direction?: {x: number, y: number}):void;

  stop():void;

  update(delta:number):void;

  isVisible?(): boolean;

  setDirection(dir:Direction):void;
}
