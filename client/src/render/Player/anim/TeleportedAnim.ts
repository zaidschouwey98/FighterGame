import { Container, Spritesheet } from "pixi.js";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import type { IAnimState } from "../IAnimState";

/** Arrivée TP : hold court, pas de VFX shader / procédural. */
export class TeleportedAnim implements IAnimState {
    constructor(
        _spriteSheets: Spritesheet[],
        _playerContainer: Container,
        _staticEffectsContainer: Container,
    ) {}

    public enter(_player: PlayerInfo): void {}

    public play(_player: PlayerInfo) {}

    public stop() {}
}
