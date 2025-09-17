import { AnimatedSprite, Container, Sprite, Spritesheet } from "pixi.js";
import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";
import { findAnimation } from "../../../../../AssetLoader";

export class HeavySwordAttack2 implements IWeaponAnim {
    private sprite: Sprite;
    private effect: AnimatedSprite;

    constructor(sprite: Sprite, playerContainer: Container, spriteSheets: Spritesheet[]) {
        this.sprite = sprite;
        this.effect = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_1")!);
        this.effect.anchor.set(0.5);
        this.effect.scale.y = -1;
        this.effect.visible = false;

        playerContainer.addChild(this.effect);
    }
    play(direction: { x: number, y: number } = { x: 0, y: 0 }): void {
        this.sprite.visible = false;
        let rotation = Math.atan2(direction.y, direction.x);

        // Vérifie si on est dans la moitié gauche du cercle
        const flipX = rotation > Math.PI / 2 || rotation < -Math.PI / 2;

        if (flipX) {
            this.effect.scale.x = -1;           // Flip horizontal
            rotation += Math.PI;           // Ajuste la rotation (retourne le sprite)
        } else {
            this.effect.scale.x = 1;
        }

        this.effect.animationSpeed = this.effect.totalFrames/20;
        this.effect.visible = true;
        this.effect.loop = false;
        this.effect.currentFrame = 0;
        this.effect.rotation = rotation;

        this.effect.play();
    }
    stop(): void {
        this.effect.visible = false;
    }
    update(_delta: number): void {

    }
    setDirection(_dir: Direction): void {

    }

}