import { AnimatedSprite, Container, Spritesheet, TextStyle, Text } from "pixi.js";
import { PlayerState } from "../../../../shared/PlayerState";
import { Direction } from "../../../../shared/Direction";
import { findAnimation, type AnimationName } from "../../AssetLoader";
import { EffectRenderer } from "../AttackEffectRenderer";
import type Player from "../../core/player/Player";
import type Position from "../../../../shared/Position";

export default class PlayerSprite {
    private playerContainer: Container;
    private animations: Record<string, AnimatedSprite> = {};
    private currentAnimation?: AnimatedSprite;
    private spriteSheets: Spritesheet[];
    private effectRenderer: EffectRenderer;

    constructor(
        public id: string,
        playerContainer: Container,
        spriteSheets: Spritesheet[],
        terrainContainer: Container,
        staticEffectsContainer: Container,
        playerName: string
    ) {
        this.playerContainer = playerContainer;
        this.spriteSheets = spriteSheets;
        this.effectRenderer = new EffectRenderer(spriteSheets, playerContainer, staticEffectsContainer);

        // Ajoute nom du joueur
        const style = new TextStyle({
            fontFamily: "Arial",
            fontSize: 8,
            fill: "#ffffff",
            stroke: "#000000",
        });
        const name = new Text(playerName, style);
        name.anchor.set(0.5);
        name.resolution = 2;
        name.y = -20;
        this.playerContainer.addChild(name);

        this.loadAnimations();
    }

    private loadAnimations() {
        const states = Object.values(PlayerState);
        const directions = Object.values(Direction);

        for (const state of states) {
            for (const dir of directions) {
                const { name, flipX } = this.getAnimName(state, dir);
                const anim = findAnimation(this.spriteSheets, name);
                if (!anim) continue;

                const sprite = new AnimatedSprite(anim);
                sprite.visible = false;
                sprite.animationSpeed = 0.2;
                sprite.anchor.set(0.5);

                if (flipX) sprite.scale.x = -1;

                const key = `${state}_${dir}`;
                this.animations[key] = sprite;
                this.playerContainer.addChild(sprite);
            }
        }
    }


    private getAnimName(state: PlayerState, dir: Direction): { name: AnimationName; flipX?: boolean } {
        switch (state) {
            case PlayerState.IDLE:
                if (dir === Direction.RIGHT) return { name: "player_idle_right" };
                if (dir === Direction.LEFT) return { name: "player_idle_right", flipX: true };
                if (dir === Direction.TOP) return { name: "player_idle_back" };
                return { name: "player_idle" };

            case PlayerState.MOVING:
                if (dir === Direction.RIGHT) return { name: "player_walk_right" };
                if (dir === Direction.LEFT) return { name: "player_walk_right", flipX: true };
                if (dir === Direction.TOP) return { name: "player_walk_up" };
                return { name: "player_walk_down" };

            case PlayerState.ATTACK_DASH:
                if (dir === Direction.RIGHT) return { name: "player_dash_attack_right" };
                if (dir === Direction.LEFT) return { name: "player_dash_attack_right", flipX: true };
                if (dir === Direction.TOP) return { name: "player_dash_attack_top" };
                return { name: "player_dash_attack_bottom" };

            case PlayerState.HIT:
                if (dir === Direction.RIGHT) return { name: "player_took_hit_from_right_side" };
                if (dir === Direction.LEFT) return { name: "player_took_hit_from_right_side", flipX: true };
                return { name: "player_took_hit_from_right_side" };

            case PlayerState.BLOCKING:
                if (dir === Direction.RIGHT) return { name: "player_block_right" };
                if (dir === Direction.LEFT) return { name: "player_block_right", flipX: true };
                return { name: "player_block_right" };

            case PlayerState.TELEPORTING:
                return { name: "after_tp_idle" };

            case PlayerState.DEAD:
                return { name: "player_die" };

            default:
                return { name: "player_idle" };
        }
    }


    public update(player: Player) {
        const key = `${player.getState()}_${(player as any).direction ?? Direction.BOTTOM}`;
        const anim = this.animations[key];
        if (!anim || anim === this.currentAnimation) return;

        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation.visible = false;
        }

        anim.visible = true;
        anim.gotoAndPlay(0);
        this.currentAnimation = anim;
    }

    public playEffect(effect: "blood" | "dash" | "teleport", pos: Position, flip = false) {
        if (effect === "blood") this.effectRenderer.renderBloodEffect(flip, pos);
        if (effect === "dash") this.effectRenderer.renderAttackDashCloud(pos);
        if (effect === "teleport") this.effectRenderer.renderTpEffect(pos);
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
