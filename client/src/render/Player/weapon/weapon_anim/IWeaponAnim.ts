import type { Direction } from "../../../../../../shared/enums/Direction";
import type PlayerInfo from "../../../../../../shared/messages/PlayerInfo";

export interface IWeaponAnim {

  play(playerInfo:PlayerInfo):void;

  stop():void;

  update(delta:number):void;

  isVisible?(): boolean;

  setDirection(dir:Direction):void;
}
