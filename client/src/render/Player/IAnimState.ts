import type PlayerInfo from "../../../../shared/PlayerInfo";

export interface IAnimState {
  play(player: PlayerInfo): void;

  stop(): void;

  enter?(player: PlayerInfo): void;
}