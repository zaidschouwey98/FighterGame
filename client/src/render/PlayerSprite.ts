import { AnimatedSprite, Container, Spritesheet, TextStyle, Text } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation } from "../AssetLoader";
import { EffectRenderer } from "./AttackEffectRenderer";
import type Player from "../../../shared/Player";
import type Position from "../../../shared/Position";
import { DASH_ATTACK_DURATION } from "../constantes";

export default class PlayerSprite {
    private uniqueAnimationPlaying: boolean = false;
    private playerContainer: Container;
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private currentAnimation?: AnimatedSprite;
    private currentAction?: Action;
    private spriteSheets: Spritesheet[];
    private EffectRenderer: EffectRenderer;
    private _terrainContainer:Container;
    constructor(public id: string, playerContainer: Container, spriteSheet: Spritesheet[],terrainContainer:Container, staticEffectsContainer: Container) {
        this.playerContainer = playerContainer;
        this.spriteSheets = spriteSheet;
        this._terrainContainer = terrainContainer;
        this.EffectRenderer = new EffectRenderer(this.spriteSheets, this.playerContainer, staticEffectsContainer);
        this.animations[Action.IDLE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle")!);
        this.animations[Action.IDLE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_right")!);

        this.animations[Action.IDLE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_left")!);

        this.animations[Action.IDLE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_back")!);

        this.animations[Action.MOVE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_right")!);
        this.animations[Action.MOVE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_left")!);
        this.animations[Action.MOVE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_down")!);
        this.animations[Action.MOVE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_up")!);
        
        this.animations[Action.BLOCK_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_block_right")!);
        this.animations[Action.BLOCK_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_block_right")!);
        this.animations[Action.BLOCK_LEFT].scale.x *= -1;
        
        this.animations[Action.BLOCK_BOTTOM] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_block_right")!);
        this.animations[Action.BLOCK_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_block_right")!);

        this.animations[Action.TELEPORT] = new AnimatedSprite(findAnimation(this.spriteSheets, "after_tp_idle")!);


        this.animations[Action.ATTACK_DASH_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_right")!);
        this.animations[Action.ATTACK_DASH_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_TOP_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_top_right")!);
        this.animations[Action.ATTACK_DASH_TOP_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_BOTTOM_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_bottom_right")!);
        this.animations[Action.ATTACK_DASH_BOTTOM_RIGHT].loop = false;

        this.animations[Action.ATTACK_DASH_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_dash_attack_top")!);
        this.animations[Action.ATTACK_DASH_TOP].loop = false;

        this.animations[Action.TOOK_HIT_FROM_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_took_hit_from_right_side")!);
        this.animations[Action.TOOK_HIT_FROM_RIGHT].onComplete = ()=>{this.playAnimation(Action.IDLE_DOWN)}
        this.animations[Action.TOOK_HIT_FROM_RIGHT].loop = false;

        this.animations[Action.TOOK_HIT_FROM_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_took_hit_from_right_side")!);
        this.animations[Action.TOOK_HIT_FROM_LEFT].onComplete = ()=>{this.playAnimation(Action.IDLE_DOWN)}
        this.animations[Action.TOOK_HIT_FROM_LEFT].loop = false;
        this.animations[Action.TOOK_HIT_FROM_LEFT].scale.x *= -1;

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

        const style = new TextStyle({
            fontFamily: "Arial",
            fontSize: 8,
            fill: "#ffffff",
            stroke: "#000000",
        });
        let name = new Text("bibite", style);
        name.anchor.set(0.5);
        name.resolution = 2;
        name.y = -20; // Position au-dessus du sprite
        this.playerContainer.addChild(name);

        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.2;
            anim.anchor.set(0.5);
            this.playerContainer.addChild(anim);
        }
    }

    overrideCurrentAnimation(action: Action, player: Player) {
        this.playUniqueAnimation(action, player);
    }


    // DASH
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
        this.currentAnimation.animationSpeed = Math.round(((this.currentAnimation.totalFrames - 4) / DASH_ATTACK_DURATION) * 100) / 100
        this.currentAnimation.currentFrame = 1;
        this.currentAnimation.onComplete = () => {
            this.uniqueAnimationPlaying = false;
            //this.playAnimation(Action.IDLE_DOWN); // TO FIX
        };
        this.currentAnimation.play();
        this.EffectRenderer?.renderAttackDashCloud(player.position);
    }

    public playDyingAnimation(playerPos:Position){
        this.uniqueAnimationPlaying = true;
        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation.visible = false;
        }

        const dyingAnim = new AnimatedSprite(findAnimation(this.spriteSheets, "player_die")!);
        dyingAnim.x = playerPos.x;
        dyingAnim.y = playerPos.y;
        this._terrainContainer.addChild(dyingAnim);
        dyingAnim.loop = false;
        dyingAnim.visible = true;
        dyingAnim.animationSpeed = 0.1;
        dyingAnim.currentFrame = 0;
        dyingAnim.play();
    }

    public playAnimation(action: Action, position?:Position) {
        if (action == this.currentAction || this.uniqueAnimationPlaying)
            return;
        this.currentAction = action;
        if (this.currentAnimation) {
            this.currentAnimation.visible = false;
            this.currentAnimation.stop();
        }


        this.currentAnimation = this.animations[action];
        this.currentAnimation!.currentFrame = 0;
        this.currentAnimation!.visible = true;
        this.currentAnimation?.play();
        if(!position) return;
        switch (action) {
            case Action.TOOK_HIT_FROM_LEFT:
                this.EffectRenderer.renderBloodEffect(false,position);
                break;
            case Action.TOOK_HIT_FROM_RIGHT:
                this.EffectRenderer.renderBloodEffect(true,position);
                break;
        
            default:
                break;
        }
    }

    public playTeleportCloud(playerPos:Position){
        this.EffectRenderer.renderTpEffect(playerPos);
    }

    public playAttackAnimation(action: Action, attackRotation: number) {
        this.EffectRenderer?.renderAttackEffect(action, attackRotation);
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
