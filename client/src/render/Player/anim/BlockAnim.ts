import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/enums/Direction";
import { findAnimation } from "../../../AssetLoader";
import DirectionHelper from "../../../../../shared/DirectionHelper";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import { BLOCK_DURATION } from "../../../../../shared/constantes";
import type { IAnimState } from "../IAnimState";

export class BlockAnim implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
        const right = new AnimatedSprite(findAnimation(spriteSheets, "player_block_right")!);
        

        const left = new AnimatedSprite(findAnimation(spriteSheets, "player_block_right")!);
        left.scale.x = -1;

        const all = [right, left];
        for (const s of all) {
            s.visible = false;
            s.animationSpeed = s.totalFrames / BLOCK_DURATION;
            s.anchor.set(0.5);
            s.loop = false;
            playerContainer.addChild(s);
        }

        this.sprites.set(Direction.RIGHT, right);
        this.sprites.set(Direction.LEFT, left);
    }

    public enter(_player: PlayerInfo): void {
    
    }

    public play(player: PlayerInfo) {
        if (!player.aimVector) return;
        const dir = DirectionHelper.getDirectionByVector(player.aimVector, [
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
}
