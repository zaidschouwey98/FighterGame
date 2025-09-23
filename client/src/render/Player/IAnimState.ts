import type PlayerInfo from "../../../../shared/PlayerInfo";

export interface IAnimState {
  play(player: PlayerInfo, stopCallBack?:()=>void): void;

  stop(): void;

  enter?(player: PlayerInfo): void;
}