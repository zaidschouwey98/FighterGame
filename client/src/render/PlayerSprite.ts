import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";
import { AttackEffectRenderer } from "./AttackEffectRenderer";
import type Player from "../../../shared/Player";

export default class PlayerSprite {
    private uniqueAnimationPlaying: boolean = false;
    private playerContainer: Container;
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private currentAnimation?: AnimatedSprite;
    private currentAction?: Action;
    private spriteSheets: Spritesheet[];
    private attackEffectRenderer: AttackEffectRenderer;
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

        this.animations[Action.ATTACK_DASH_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_right")!);
        this.animations[Action.ATTACK_DASH_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_TOP_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_top_right")!);
        this.animations[Action.ATTACK_DASH_TOP_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_BOTTOM_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_bottom_right")!);
        this.animations[Action.ATTACK_DASH_BOTTOM_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_top")!);
        this.animations[Action.ATTACK_DASH_TOP].loop = false;

        this.animations[Action.ATTACK_DASH_BOTTOM] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_bottom")!);
        this.animations[Action.ATTACK_DASH_BOTTOM].loop = false;

        this.animations[Action.ATTACK_DASH_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_right")!);
        this.animations[Action.ATTACK_DASH_LEFT].loop = false;
        this.animations[Action.ATTACK_DASH_LEFT].scale.x *= -1;


        this.animations[Action.ATTACK_DASH_TOP_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_top_right")!);
        this.animations[Action.ATTACK_DASH_TOP_LEFT].loop = false;
        this.animations[Action.ATTACK_DASH_TOP_LEFT].scale.x *= -1;


        this.animations[Action.ATTACK_DASH_BOTTOM_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_bottom_right")!);
        this.animations[Action.ATTACK_DASH_BOTTOM_LEFT].loop = false;
        this.animations[Action.ATTACK_DASH_BOTTOM_LEFT].scale.x *= -1;

        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.2;
            anim.anchor.set(0.5);
            this.playerContainer.addChild(anim);
        }
    }

    overrideCurrentAnimation(action: Action, player: Player){
        this.playUniqueAnimation(action,player);
    }


    private playUniqueAnimation(action: Action, player: Player) {
        const anim = this.animations[action];
        if (!anim) return;

        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation.visible = false;
        }

        this.uniqueAnimationPlaying = true;
        this.currentAnimation = anim;
        this.currentAnimation.visible = true;
        this.currentAnimation.animationSpeed = 0.3;
        this.currentAnimation.currentFrame = 3;
        this.currentAnimation.onComplete = () => {
            this.uniqueAnimationPlaying = false;
        };
        this.currentAnimation.play();
        this.attackEffectRenderer?.renderDashCloud(player.position);
    }


    public playAnimation(action: Action) {
        if (action == this.currentAction || this.uniqueAnimationPlaying)
            return;
        this.currentAction = action;
        if (this.currentAnimation) {
            this.currentAnimation.visible = false;
            this.currentAnimation.stop();
        }

     
        this.currentAnimation = this.animations[action];
        this.currentAnimation!.visible = true;
        this.currentAnimation?.play();
        
    }



    public playAttackAnimation(action: Action, attackRotation: number) {
        this.attackEffectRenderer?.renderAttackEffect(action, attackRotation);
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
