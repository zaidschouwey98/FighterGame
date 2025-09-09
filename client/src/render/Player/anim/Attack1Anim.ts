import type { Container, Spritesheet } from "pixi.js";
import type Player from "../../../core/player/Player";
import type { IAnimState } from "./IAnimState";
import type { EffectRenderer } from "../../EffectRenderer";
import { PlayerState } from "../../../../../shared/PlayerState";

export class Attack1Anim implements IAnimState{
    constructor(
        spriteSheets: Spritesheet[],
        playerContainer: Container,
        private effectRenderer: EffectRenderer
    ){

    }
    
    play(player: Player): void {
        
    }
    stop(): void {
        
    }
    enter?(player: Player): void {
        this.effectRenderer.renderAttackEffect(PlayerState.ATTACK_1, player.mouseDirection);
    }

}