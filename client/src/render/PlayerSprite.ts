import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";
import { AttackEffectRenderer } from "./AttackEffectRenderer";
import type Position from "../../../shared/Position";

export default class PlayerSprite {
    private uniqueAnimationPlaying: boolean = false;
    private playerContainer: Container;
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private currentAnimation?: AnimatedSprite;
    private currentAction?: Action;
    private spriteSheets: Spritesheet[];
    private attackEffectRenderer: AttackEffectRenderer | undefined;
    constructor(public id: string, playerContainer: Container, spriteSheet: Spritesheet[], globalContainer: Container) {
        this.playerContainer = playerContainer;
        this.spriteSheets = spriteSheet;
        this.attackEffectRenderer = new AttackEffectRenderer(this.spriteSheets, this.playerContainer, globalContainer);
        this.animations[Action.IDLE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle")!);
        this.animations[Action.IDLE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_right")!);

        this.animations[Action.IDLE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_left")!);

        this.animations[Action.IDLE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_back")!);

        this.animations[Action.MOVE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_right")!);
        this.animations[Action.MOVE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_left")!);
        this.animations[Action.MOVE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_down")!);
        this.animations[Action.MOVE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_up")!);

        this.animations[Action.ATTACK_DASH] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_right")!);
        this.animations[Action.ATTACK_DASH].loop = false;
        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.1;
            anim.anchor.set(0.5);
            this.playerContainer.addChild(anim);
        }
    }

    private playUniqueAnimation(action:Action,playerPos:Position) {
        if(!this.animations[action])
            return;
        switch(action){
            case Action.ATTACK_DASH:
                this.uniqueAnimationPlaying = true;
                this.currentAnimation = this.animations[action]
                this.currentAnimation.visible = true;
                this.currentAnimation.animationSpeed = 0.3;
                this.currentAnimation.currentFrame = 2;
                this.currentAnimation.onComplete = ()=>{
                    this.uniqueAnimationPlaying = false;
                };
                this.currentAnimation.play();
                this.attackEffectRenderer?.renderDashCloud(playerPos)
                break;
        }
        

    }

    public playAnimation(action: Action, playerPos:Position) {
        if (action == this.currentAction || this.uniqueAnimationPlaying)
            return;
        this.currentAction = action;
        if (this.currentAnimation) {
            this.currentAnimation.visible = false;
            this.currentAnimation.stop();
        }
        switch (action) {
            case Action.ATTACK_DASH:
                this.playUniqueAnimation(action,playerPos)
                break;
            // case Action.DASH:
            //     this.playUniqueAnimation(action)
            //     break;

            default:
                this.currentAnimation = this.animations[action];
                this.currentAnimation!.visible = true;
                this.currentAnimation?.play();
                break;
        }
    }

    public playAttackAnimation(action: Action, attackRotation: number) {
        this.attackEffectRenderer?.renderAttackEffect(action, attackRotation);
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
