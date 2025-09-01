import { AnimatedSprite, Texture, Container, Spritesheet } from "pixi.js";
import { Action } from "../enums/Action";
import { findAnimation, getSpritesheets } from "../AssetLoader";

export default class PlayerSprite {
    private playerContainer: Container;
    private animations: Partial<Record<Action, AnimatedSprite>> = {};
    private currentAnimation?: AnimatedSprite;
    private spriteSheets: Spritesheet[] | undefined;

    constructor(public id: string, playerContainer: Container) {
        this.playerContainer = playerContainer;

        // TODO: charger les bonnes textures selon les assets
        
    }

    public async initialize(){
        this.spriteSheets = await getSpritesheets();

        this.animations[Action.IDLE_DOWN] = new AnimatedSprite(findAnimation(this.spriteSheets, "player_idle")!);
        this.animations[Action.MOVE_RIGHT] = new AnimatedSprite(findAnimation(this.spriteSheets,"player_walk_right")!);

        for (const anim of Object.values(this.animations)) {
            anim.visible = false;
            anim.animationSpeed = 0.1;
            this.playerContainer.addChild(anim);
        }
    }

    public playAnimation(action: Action) {
        if (this.currentAnimation) {
            this.currentAnimation.visible = false;
            this.currentAnimation.stop();
        }

        const anim = this.animations[action];
        if (anim) {
            this.currentAnimation = anim;
            anim.visible = true;
            anim.play();
        }
    }

    public destroy() {
        this.playerContainer.destroy({ children: true });
    }
}
