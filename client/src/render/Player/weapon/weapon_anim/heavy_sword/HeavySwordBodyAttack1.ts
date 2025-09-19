import type PlayerInfo from "../../../../../../../shared/PlayerInfo";
import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { findAnimation } from "../../../../../AssetLoader";
import { Direction } from "../../../../../../../shared/Direction";
import AnimHelper from "../../../../../helper/AnimHelper";
import type { IAnimState } from "../../../IAnimState";

export class HeavySwordBodyAttack1 implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(
        spriteSheets: Spritesheet[], playerContainer: Container
    ) {
        const right = new AnimatedSprite(findAnimation(spriteSheets, "sword_character_body_attack_1")!);


        // Left = flip du right
        const left = new AnimatedSprite(findAnimation(spriteSheets, "sword_character_body_attack_1")!);
        left.scale.x = -1;

        const all = [right, left];
        for (const s of all) {
            s.visible = false;
            s.animationSpeed = 0.16;
            s.anchor.set(0.5);
            s.loop = false;
            playerContainer.addChild(s);
        }

        this.sprites.set(Direction.RIGHT, right);
        this.sprites.set(Direction.LEFT, left);
    }

    play(player: PlayerInfo): void {
        if (!player.mouseDirection) return;
        const dir = AnimHelper.getDirectionByVector(player.mouseDirection, [
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
    stop(): void {
        if (!this.current) return;
        this.current.stop();
        this.current.visible = false;
        this.current = undefined;
        this.lastDir = undefined;
    }
    enter?(_player: PlayerInfo): void {
        // this.effectRenderer.renderAttackEffect(PlayerState.ATTACK_1, player.mouseDirection);
    }

}