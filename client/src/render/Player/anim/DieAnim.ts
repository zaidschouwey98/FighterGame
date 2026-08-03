import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { findAnimation } from "../../../AssetLoader";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";
import type { IAnimState } from "../IAnimState";

/** Nombre max de corps restants sur la map (FIFO au-delà) */
const MAX_CORPSES = 8;

export class DieAnim implements IAnimState {
    /** Corps terminés, laissés sur le terrain */
    private static corpses: AnimatedSprite[] = [];

    private current?: AnimatedSprite;

    constructor(private spriteSheets: Spritesheet[], private terrainContainer: Container) {
    }

    public play(player: PlayerInfo, stopCallBack?: () => void) {
        // Nettoyer une anim de mort en cours sur cette instance (pas les corps déjà laissés)
        this.disposePlaying();

        const dyingAnim = new AnimatedSprite(findAnimation(this.spriteSheets, "player_die")!);
        dyingAnim.anchor.set(0.5);
        dyingAnim.x = player.position.x;
        dyingAnim.y = player.position.y;
        dyingAnim.loop = false;
        dyingAnim.visible = true;
        dyingAnim.animationSpeed = 0.1;
        dyingAnim.currentFrame = 0;
        dyingAnim.onComplete = () => {
            // Gelé sur la dernière frame = corps
            dyingAnim.gotoAndStop(dyingAnim.totalFrames - 1);
            dyingAnim.onComplete = undefined;
            this.current = undefined;
            DieAnim.registerCorpse(dyingAnim);
            stopCallBack?.();
        };

        this.terrainContainer.addChild(dyingAnim);
        this.current = dyingAnim;
        dyingAnim.play();
    }

    public stop() {
        // Si on coupe l'anim en cours, on la drop entièrement (pas un corps finalisé)
        this.disposePlaying();
    }

    private disposePlaying() {
        if (!this.current) return;
        this.current.stop();
        this.current.onComplete = undefined;
        if (this.current.parent) {
            this.current.parent.removeChild(this.current);
        }
        this.current.destroy();
        this.current = undefined;
    }

    private static registerCorpse(sprite: AnimatedSprite) {
        DieAnim.corpses.push(sprite);
        while (DieAnim.corpses.length > MAX_CORPSES) {
            const oldest = DieAnim.corpses.shift();
            if (!oldest) break;
            if (oldest.parent) oldest.parent.removeChild(oldest);
            oldest.destroy();
        }
    }
}
