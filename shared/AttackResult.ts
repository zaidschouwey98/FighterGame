import Player from "./Player";

export interface AttackResult{
    hitPlayers:Player[];
    attackerId:string;
    knockbackStrength:number;
}