import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";
import type Position from "../../../shared/Position";

export class AttackEffectRenderer {
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private dashCloud: AnimatedSprite;
    private attackEffectContainer: Container;
    constructor(spriteSheets: Spritesheet[], playerContainer: Container, globalContainer: Container) {
        this.attackEffectContainer = new Container();
        playerContainer.addChild(this.attackEffectContainer);

        this.animations[Action.ATTACK_1] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        this.animations[Action.ATTACK_2] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);
        this.dashCloud = new AnimatedSprite(findAnimation(spriteSheets, "player_dash_attack_effect")!);
        this.dashCloud.visible = false;
        this.dashCloud.anchor.set(0.5);
        globalContainer.addChild(this.dashCloud);
        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.5;
            anim.anchor.set(0.5, 0.5)
            this.attackEffectContainer.addChild(anim);
        }
    }


    renderDashCloud(playerPos: Position) {
        this.dashCloud.x = playerPos.x;
        this.dashCloud.y = playerPos.y;
        this.dashCloud.visible = true;
        this.dashCloud.loop = false;
        this.dashCloud.animationSpeed = 0.5;
        this.dashCloud.currentFrame = 0;
        this.dashCloud.play();
        this.dashCloud.onComplete = () => { this.dashCloud.visible = false }
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