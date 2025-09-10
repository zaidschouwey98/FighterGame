import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { PlayerState } from "../../../shared/PlayerState";
import { findAnimation } from "../AssetLoader";
import type Position from "../../../shared/Position";
import { Direction } from "../../../shared/Direction";

export class EffectRenderer {
    private animations: Partial<Record<PlayerState, AnimatedSprite>> = {};
    private attackEffectContainer: Container;
    private staticEffectsContainer: Container;
    private spriteSheets: Spritesheet[];
    constructor(spriteSheets: Spritesheet[], playerContainer: Container, staticEffectsContainer: Container) {
        this.staticEffectsContainer = staticEffectsContainer;
        this.spriteSheets = spriteSheets;
        this.attackEffectContainer = new Container();
        playerContainer.addChild(this.attackEffectContainer);
        this.animations[PlayerState.ATTACK_1] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        this.animations[PlayerState.ATTACK_2] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);

        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.5;
            anim.anchor.set(0.5, 0.5)
            this.attackEffectContainer.addChild(anim);
        }
    }

    renderAttackDashCloud(playerPos: Position) {
        const newDashCloud = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_effect")!);
        newDashCloud.anchor.set(0.5)
        newDashCloud.x = playerPos.x;
        newDashCloud.y = playerPos.y;
        newDashCloud.visible = true;
        newDashCloud.loop = false;
        newDashCloud.animationSpeed = 0.2;
        newDashCloud.currentFrame = 0;
        newDashCloud.play();
        newDashCloud.onComplete = () => { newDashCloud.destroy() }
        this.staticEffectsContainer.addChild(newDashCloud)
    }

    renderTpEffect(playerPos: Position) {
        const tp_effect = new AnimatedSprite(findAnimation(this.spriteSheets, "tp_effect")!);
        tp_effect.anchor.set(0.5)
        tp_effect.x = playerPos.x;
        tp_effect.y = playerPos.y;
        tp_effect.visible = true;
        tp_effect.loop = false;
        tp_effect.animationSpeed = 0.2;
        tp_effect.currentFrame = 0;
        tp_effect.play();
        tp_effect.onComplete = () => { tp_effect.destroy() }
        this.staticEffectsContainer.addChild(tp_effect)
    }

    renderAttackEffect(action: PlayerState, direction: { x: number; y: number }) {
        if (action !== PlayerState.ATTACK_1 && action !== PlayerState.ATTACK_2) return;

        const sprite = this.animations[action];
        if (!sprite) return;

        // Calcule la rotation en radians
        const rotation = Math.atan2(direction.y, direction.x);

        sprite.visible = true;
        sprite.loop = false;
        sprite.currentFrame = 0;
        sprite.rotation = rotation;
        sprite.play();
        sprite.onComplete = () => {
            sprite.visible = false;
        };
    }

}