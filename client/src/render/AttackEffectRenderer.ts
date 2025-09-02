import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";

export class AttackEffectRenderer{
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private attackEffectContainer:Container;
    constructor(spriteSheets:Spritesheet[], playerContainer:Container){
        this.attackEffectContainer = new Container();
        playerContainer.addChild(this.attackEffectContainer);
        this.animations[Action.ATTACK_1] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.5;
            this.attackEffectContainer.addChild(anim);
        }
    }

    renderAttackEffect(action:Action){
        if(action != Action.ATTACK_1 && action != Action.ATTACK_2 && action != Action.ATTACK_3)
            return;
        
        switch (action) {
            case Action.ATTACK_1:
                this.animations[action]!.visible = true;
                this.animations[action]!.loop = false;
                this.animations[action]!.currentFrame = 0;
                this.animations[action]!.play();
                this.animations[action]!.onComplete = ()=>{this.animations[action]!.visible=false}

                break;
        
            default:
                break;
        }
    }

}