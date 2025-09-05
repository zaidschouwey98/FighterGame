import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";
import type Position from "../../../shared/Position";

export class EffectRenderer {
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private attackEffectContainer: Container;
    private staticEffectsContainer:Container;
    private spriteSheets:Spritesheet[];
    constructor(spriteSheets: Spritesheet[], playerContainer: Container, staticEffectsContainer: Container) {
        this.staticEffectsContainer = staticEffectsContainer;
        this.spriteSheets = spriteSheets;
        this.attackEffectContainer = new Container();
        playerContainer.addChild(this.attackEffectContainer);
        this.animations[Action.ATTACK_1] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        this.animations[Action.ATTACK_2] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);

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

    renderTpEffect(playerPos:Position){
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

    renderAttackEffect(action: Action, rotation: number) {
        if (action != Action.ATTACK_1 && action != Action.ATTACK_2 && action != Action.ATTACK_3)
            return;
        this.animations[action]!.visible = true;
        this.animations[action]!.loop = false;
        this.animations[action]!.currentFrame = 0;
        this.animations[action]!.rotation = rotation;
        this.animations[action]!.play();
        this.animations[action]!.onComplete = () => { this.animations[action]!.visible = false }
    }

}