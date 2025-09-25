import type PlayerInfo from "./PlayerInfo";

export interface AttackResult {
    newHp: number;
    knockBackVector: {dx:number, dy:number};
    knockbackTimer: number;
}