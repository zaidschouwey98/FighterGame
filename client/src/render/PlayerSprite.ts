import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Action } from "../../../shared/Action";
import { findAnimation, getSpritesheets } from "../AssetLoader";
import type Player from "../../../shared/Player";

export default class PlayerSprite {
    private playerContainer: Container;
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private currentAnimation?: AnimatedSprite;
    private currentAction?: Action;
    private spriteSheets: Spritesheet[] | undefined;

    constructor(public id: string, playerContainer: Container) {
        this.playerContainer = playerContainer;
    }

    public async initialize() {
        this.spriteSheets = await getSpritesheets();

        this.animations[Action.IDLE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle")!);
        this.animations[Action.IDLE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_right")!);

        this.animations[Action.IDLE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_left")!);

        this.animations[Action.IDLE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle_back")!);

        this.animations[Action.MOVE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_right")!);
        this.animations[Action.MOVE_LEFT] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_left")!);
        this.animations[Action.MOVE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_down")!);
        this.animations[Action.MOVE_TOP] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_walk_up")!);

        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.1;
            this.playerContainer.addChild(anim);
        }
    }

    public playAnimation(action: Action) {
        if(action == this.currentAction)
            return; // Pas besoin de changer action
        this.currentAction = action;

        if (this.currentAnimation) {
            this.currentAnimation.visible = false;
            this.currentAnimation.stop();
        }

        this.currentAnimation = this.animations[action];
        this.currentAnimation!.visible = true;
        this.currentAnimation?.play();
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
