import type { Direction } from "../../../../../../shared/Direction";
import type PlayerInfo from "../../../../../../shared/PlayerInfo";

export interface IWeaponAnim {

  play(playerInfo:PlayerInfo):void;

  stop():void;

  update(delta:number):void;

  isVisible?(): boolean;

  setDirection(dir:Direction):void;
}
