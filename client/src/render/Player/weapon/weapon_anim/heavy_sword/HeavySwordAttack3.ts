import { AnimatedSprite, Container, Sprite, Spritesheet } from "pixi.js";
import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";
import { findAnimation } from "../../../../../AssetLoader";

export class HeavySwordAttack3 implements IWeaponAnim {
    private sprite: Sprite;
    private effect: AnimatedSprite;
    private previousSpriteData: any;

    private attackDuration:number = 30;

    private baseRotation?:number;
    private currentRotation?:number;
    private targetRotation?:number;

    constructor(sprite: Sprite, playerContainer: Container, spriteSheets: Spritesheet[]) {
        this.sprite = sprite;
        this.effect = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);
        this.effect.anchor.set(0.5);
        this.effect.scale.y = -1;
        this.effect.visible = false;
        playerContainer.addChild(this.effect);
    }
    play(direction: { x: number, y: number } = { x: 0, y: 0 }): void {
        this.previousSpriteData = {rotation:this.sprite.rotation};
        let rotation = Math.atan2(direction.y, direction.x);
        console.log(rotation);
        this.baseRotation = rotation;
        this.sprite.rotation = this.baseRotation;
        this.currentRotation = rotation;
        this.targetRotation = rotation - 2*Math.PI
        this.sprite.anchor.set(1.1,0.5)
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
        this.sprite.anchor.set(0.92,0.5)
    }
    update(_delta: number): void {
        // delta = 0.36 quand ordi puissant, 0.88 quand ordit a chier
        if(!this.currentRotation || !this.baseRotation || !this.targetRotation) return;
        if(this.sprite.rotation < this.targetRotation){
            this.sprite.anchor.set(0.92,0.5)
            return;
        }
        this.sprite.rotation -= (Math.PI / 4) * _delta;

        // let y = Math.sin(this.currentRotation)*10; // nok

        // let x = Math.cos(this.currentRotation)*10; // ok
        // this.sprite.x = x;
        // this.sprite.y = y;
        // this.sprite.rotation = this.currentRotation;
        // this.currentRotation -= Math.PI/16;
    }
    setDirection(_dir: Direction): void {

    }

}