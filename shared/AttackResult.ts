import { PlayerInfo } from "./PlayerInfo";

export interface AttackResult{
    hitPlayers:PlayerInfo[];
    attackerId:string;
    knockbackStrength:number;
}