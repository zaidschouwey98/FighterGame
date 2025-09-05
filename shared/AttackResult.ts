import type PlayerInfo from "./PlayerInfo";

export interface AttackResult{
    hitPlayers:PlayerInfo[];
    attackerId:string;
    knockbackStrength:number;
    blockedBy?:PlayerInfo;
}