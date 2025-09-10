import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import type Player from "../../../core/player/Player";
import { findAnimation } from "../../../AssetLoader";
import type { IAnimState } from "./IAnimState";
import AnimHelper from "../../../helper/AnimHelper";
import { KNOCKBACK_TIMER } from "../../../constantes";
import type PlayerInfo from "../../../../../shared/PlayerInfo";

export class KnockBackAnim implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
        // Right
        const right = new AnimatedSprite(findAnimation(spriteSheets, "knockback_from_right")!);
        right.scale.x = -1;

        // Left = flip du right
        const left = new AnimatedSprite(findAnimation(spriteSheets, "knockback_from_right")!);


        const all = [right, left];
        for (const s of all) {
            s.visible = false;
            s.animationSpeed = s.totalFrames / KNOCKBACK_TIMER;
            s.anchor.set(0.5);
            s.loop = true;
            playerContainer.addChild(s);
        }

        this.sprites.set(Direction.RIGHT, right);
        this.sprites.set(Direction.LEFT, left);
    }

    public enter(player: PlayerInfo): void {
        if (!player.knockbackReceivedVector) throw new Error("KnockbackVector shouldn't be undefined at this point.");
    }

    public play(player: Player) {
        if (!player.knockbackReceivedVector) return;
        const dir = AnimHelper.getDirectionByVector(player.knockbackReceivedVector, [
            Direction.RIGHT,
            Direction.LEFT
        ]);
  
        if (dir === this.lastDir && this.current) return;
        this.lastDir = dir;

        if (this.current) {
            this.current.stop();
            this.current.visible = false;
        }

        const next = this.sprites.get(dir) ?? this.sprites.get(Direction.RIGHT)!;
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
