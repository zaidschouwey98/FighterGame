import type Player from "../../../core/player/Player";
import type { IAnimState } from "./IAnimState";

export class HitAnim implements IAnimState{
    constructor(){
        
    }
    play(player: Player): void {
        throw new Error("Method not implemented.");
    }
    stop(): void {
        throw new Error("Method not implemented.");
    }
    enter?(player: Player): void {
        throw new Error("Method not implemented.");
    }
    
}