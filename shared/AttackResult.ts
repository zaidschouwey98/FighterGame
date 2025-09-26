import type PlayerInfo from "./PlayerInfo";

export interface AttackResult {
    newHp: number;
    knockbackData: KnockbackData;
}

export interface KnockbackData {
    knockbackVector: {dx:number, dy:number};
    knockbackTimer: number;
}