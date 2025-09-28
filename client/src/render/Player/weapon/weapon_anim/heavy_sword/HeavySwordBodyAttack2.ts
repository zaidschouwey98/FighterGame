import type PlayerInfo from "../../../../../../../shared/messages/PlayerInfo";
import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { findAnimation } from "../../../../../AssetLoader";
import { Direction } from "../../../../../../../shared/enums/Direction";
import DirectionHelper from "../../../../../../../shared/DirectionHelper";
import type { IAnimState } from "../../../IAnimState";
import { HEAVY_SWORD_ATTACK_2_BASE_DURATION } from "../../../../../../../shared/constantes";

export class HeavySwordBodyAttack2 implements IAnimState {
    private sprites = new Map<Direction, AnimatedSprite>();
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(
        spriteSheets: Spritesheet[], playerContainer: Container
    ) {
        const right = new AnimatedSprite(findAnimation(spriteSheets, "sword_character_body_attack_2")!);

        // Left = flip du right
        const left = new AnimatedSprite(findAnimation(spriteSheets, "sword_character_body_attack_2")!);
        left.scale.x = -1;

        const all = [right, left];
        for (const s of all) {
            s.visible = false;
            s.anchor.set(0.5);
            s.loop = false;
            playerContainer.addChild(s);
        }

        this.sprites.set(Direction.RIGHT, right);
        this.sprites.set(Direction.LEFT, left);
    }

    play(player: PlayerInfo): void {
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
        next.animationSpeed = next.totalFrames/(HEAVY_SWORD_ATTACK_2_BASE_DURATION / player.attackSpeed);
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
        // this.effectRenderer.renderAttackEffect(PlayerState.ATTACK_1, player.aimVector);
    }

}