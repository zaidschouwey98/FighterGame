import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import type Player from "../../../core/player/Player";
import { findAnimation } from "../../../AssetLoader";
import type { IAnimState } from "./IAnimState";
import AnimHelper from "../../../helper/AnimHelper";
import { KNOCKBACK_TIMER } from "../../../constantes";
import type PlayerInfo from "../../../../../shared/PlayerInfo";
import type Position from "../../../../../shared/Position";

export class HitAnim implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(private spriteSheets: Spritesheet[], private playerContainer: Container) {
        // Right
        const right = new AnimatedSprite(findAnimation(spriteSheets, "player_took_hit_from_right_side")!);
        right.scale.x = -1;

        // Left = flip du right
        const left = new AnimatedSprite(findAnimation(spriteSheets, "player_took_hit_from_right_side")!);


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
        const dir = AnimHelper.getDirectionByVector(player.knockbackReceivedVector, [
            Direction.RIGHT,
            Direction.LEFT,
            Direction.TOP,
            Direction.BOTTOM
        ]);
        this.renderBloodEffect(dir);

    }

    public play(player: Player) {
        if (!player.knockbackReceivedVector) return;
        const dir = AnimHelper.getDirectionByVector(player.knockbackReceivedVector, [
            Direction.RIGHT,
            Direction.LEFT
        ]);
        // si même direction, ne pas reset l'anim
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

    private renderBloodEffect(direction: Direction) {
        const bloodEffect = new AnimatedSprite(findAnimation(this.spriteSheets, "took_hit_from_right_effect")!);
        switch (direction) {
            case Direction.BOTTOM:
                bloodEffect.rotation -= Math.PI / 2
                break;
            case Direction.RIGHT:
                bloodEffect.scale.x *= -1;
                break;
            case Direction.LEFT:

                break;
            case Direction.TOP:
                bloodEffect.rotation += Math.PI / 2
                break;
            default:
                break;
        }

        bloodEffect.anchor.set(0.5)
        bloodEffect.visible = true;
        bloodEffect.loop = false;
        bloodEffect.animationSpeed = 0.3;
        bloodEffect.gotoAndPlay(0);
        bloodEffect.onComplete = () => { bloodEffect.destroy() }
        this.playerContainer.addChild(bloodEffect)
    }
}
