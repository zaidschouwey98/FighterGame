import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import { findAnimation } from "../../../AssetLoader";
import type PlayerInfo from "../../../../../shared/PlayerInfo";
import type { IAnimState } from "../IAnimState";

export class TeleportingAnim implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(private spriteSheets: Spritesheet[], playerContainer: Container, private staticEffectsContainer: Container) {
        const teleport = new AnimatedSprite(findAnimation(spriteSheets, "after_tp_idle")!);
        teleport.visible = false;
        teleport.animationSpeed = 0.3;
        teleport.anchor.set(0.5);
        teleport.loop = true;
        playerContainer.addChild(teleport);
        this.sprites.set(Direction.BOTTOM, teleport);
    }

    public enter(player: PlayerInfo): void {
        const tp_effect = new AnimatedSprite(findAnimation(this.spriteSheets, "tp_effect")!);
        tp_effect.anchor.set(0.5)
        tp_effect.x = player.position.x;
        tp_effect.y = player.position.y;
        tp_effect.visible = true;
        tp_effect.loop = false;
        tp_effect.animationSpeed = 0.2;
        tp_effect.currentFrame = 0;
        tp_effect.play();
        tp_effect.onComplete = () => { tp_effect.destroy() }
        this.staticEffectsContainer.addChild(tp_effect)
    }

    public play(_player: PlayerInfo) {
        const dir = Direction.BOTTOM
        if (dir === this.lastDir && this.current) return;
        this.lastDir = dir;

        if (this.current) {
            this.current.stop();
            this.current.visible = false;
        }
        const next = this.sprites.get(dir) ?? this.sprites.get(Direction.BOTTOM)!;
        next.visible = true;
        next.gotoAndPlay(0);
        this.current = next;
    }

    public stop() {
        if (!this.current) return;
        this.current.stop();
        this.current.visible = false;
        this.current = undefined;
        this.lastDir = undefined;
    }
}
