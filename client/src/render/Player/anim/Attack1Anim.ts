import type { IAnimState } from "./IAnimState";
import type { EffectRenderer } from "../../EffectRenderer";
import { PlayerState } from "../../../../../shared/PlayerState";
import type PlayerInfo from "../../../../../shared/PlayerInfo";

export class Attack1Anim implements IAnimState {
    constructor(
        private effectRenderer: EffectRenderer
    ) {}

    play(_player: PlayerInfo): void {

    }
    stop(): void {

    }
    enter?(player: PlayerInfo): void {
        this.effectRenderer.renderAttackEffect(PlayerState.ATTACK_1, player.mouseDirection);
    }

}