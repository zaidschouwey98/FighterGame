import { AnimatedSprite, Container, Graphics, Spritesheet } from "pixi.js";
import { EntityState } from "../../../shared/messages/EntityState";
import { findAnimation } from "../AssetLoader";
import type Position from "../../../shared/Position";

export class EffectRenderer {
    private animations: Partial<Record<EntityState, AnimatedSprite>> = {};
    private attackEffectContainer: Container;
    private staticEffectsContainer: Container;
    private spriteSheets: Spritesheet[];
    private tpDestinationCircle?: Graphics;
    constructor(spriteSheets: Spritesheet[], playerContainer: Container, staticEffectsContainer: Container) {
        this.staticEffectsContainer = staticEffectsContainer;
        this.spriteSheets = spriteSheets;
        this.attackEffectContainer = new Container();
        playerContainer.addChild(this.attackEffectContainer);
        // this.animations[PlayerState.ATTACK_1] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        // this.animations[PlayerState.ATTACK_2] = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);

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
        newDashCloud.onComplete = () => { 
            this.staticEffectsContainer.removeChild(newDashCloud);
            newDashCloud.destroy() 
        }
        this.staticEffectsContainer.addChild(newDashCloud)
    }

    renderTpDestination(position?:Position){
        if(!position){
            this.tpDestinationCircle && this.staticEffectsContainer.removeChild(this.tpDestinationCircle);
            this.tpDestinationCircle?.destroy();
            this.tpDestinationCircle = undefined;
            return;
        }
        if(!this.tpDestinationCircle){
            this.tpDestinationCircle = new Graphics().circle(0,0, 3).stroke({ width:2,color: 0xff0000 });
            this.staticEffectsContainer.addChild(this.tpDestinationCircle);
        }
        this.tpDestinationCircle.x = position.x;
        this.tpDestinationCircle.y = position.y;
        
    }
    clearTpDestionation(){

    }
}