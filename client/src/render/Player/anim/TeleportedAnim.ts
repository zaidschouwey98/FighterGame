import { AnimatedSprite, ColorMatrixFilter, Container, Spritesheet, Ticker } from "pixi.js";
import { Direction } from "../../../../../shared/enums/Direction";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import type { IAnimState } from "../IAnimState";
import { BulgePinchFilter, ShockwaveFilter } from "pixi-filters";

export class TeleportedAnim implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(private spriteSheets: Spritesheet[], private playerContainer: Container, private tileContainer: Container) {

    }

    public enter(player: PlayerInfo): void {
        const ticker = Ticker.shared;

        const localPos = this.tileContainer.toGlobal(player.position)
        const shockwave = new ShockwaveFilter();
        shockwave.center = [localPos.x, localPos.y];
        shockwave.speed = 250
        shockwave.wavelength = 30;
        shockwave.amplitude = 30;
        shockwave.wavelength = 160;
        shockwave.brightness = 1.0;
        shockwave.radius = 300

  
        
        
        this.tileContainer.filters = [ shockwave];

        ticker.add(() => {
            shockwave.time += 0.02;
        });

    }

    public play(_player: PlayerInfo) {

    }

    public stop() {
        if (!this.current) return;
        this.current.stop();
        this.current.visible = false;
        this.current = undefined;
        this.lastDir = undefined;
    }
}
