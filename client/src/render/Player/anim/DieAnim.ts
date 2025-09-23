import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import { findAnimation } from "../../../AssetLoader";
import type PlayerInfo from "../../../../../shared/PlayerInfo";
import type { IAnimState } from "../IAnimState";

export class DieAnim implements IAnimState {
    private current?: AnimatedSprite;
    private lastDir?: Direction;

    constructor(private spriteSheets: Spritesheet[], private terrainContainer: Container) {

    }

    public play(player: PlayerInfo, stopCallBack?:()=>void) {
        const dir = Direction.BOTTOM
        // si même direction, ne pas reset l'anim
        if (dir === this.lastDir && this.current) return;
        this.lastDir = dir;

        if (this.current) {
            this.current.stop();
            this.current.visible = false;
        }

        const dyingAnim = new AnimatedSprite(findAnimation(this.spriteSheets, "player_die")!);
        dyingAnim.anchor.set(0.5);
        dyingAnim.x = player.position.x;
        dyingAnim.y = player.position.y;
        this.terrainContainer.addChild(dyingAnim);
        dyingAnim.loop = false;
        dyingAnim.visible = true;
        dyingAnim.animationSpeed = 0.1;
        dyingAnim.currentFrame = 0;
        dyingAnim.onComplete = stopCallBack;
        dyingAnim.play();
    }

    public stop() {
        if (!this.current) return;
        this.current.stop();
        this.current.visible = false;
        this.current = undefined;
        this.lastDir = undefined;
    }
}
