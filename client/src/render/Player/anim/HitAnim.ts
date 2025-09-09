import type PlayerInfo from "../../../../../shared/PlayerInfo";
import type { IAnimState } from "./IAnimState";

export class HitAnim implements IAnimState{
    constructor(){

    }
    play(player: PlayerInfo): void {
        throw new Error("Method not implemented.");
    }
    stop(): void {
        throw new Error("Method not implemented.");
    }
    enter?(player: PlayerInfo): void {
        throw new Error("Method not implemented.");
    }
    
}