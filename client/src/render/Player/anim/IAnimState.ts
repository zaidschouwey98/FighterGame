import type Player from "../../../core/player/Player";

export interface IAnimState {
  play(player: Player): void;

  stop(): void;

  enter?(player: Player): void;
}