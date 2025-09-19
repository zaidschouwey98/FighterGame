import { AnimatedSprite, Container, copySearchParams, ObservablePoint, Point, Sprite, Spritesheet, type PointLike } from "pixi.js";
import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";
import { findAnimation } from "../../../../../AssetLoader";

export class HeavySwordAttack1 implements IWeaponAnim {
    private sprite: Sprite;
    private effect: AnimatedSprite;

    private targetRotation?: number;
    private baseRotation?: number;

    private baseX?: number;
    private baseY?: number;
    private baseAnchor: PointLike = new Point();

    private duration:number = 40;
    private progress = 0; // entre 0 et 1
    private inverseRotation:boolean = false;

    constructor(sprite: Sprite, playerContainer: Container, spriteSheets: Spritesheet[]) {
        this.sprite = sprite;
        this.effect = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);
        this.effect.anchor.set(0.5);

        playerContainer.addChild(this.effect);
    }
    play(direction: { x: number, y: number } = { x: 0, y: 0 }): void {
        this.inverseRotation = false;
        this.progress = 0;
        this.baseX = this.sprite.x;
        this.baseY = this.sprite.y;
        this.sprite.anchor.copyTo(this.baseAnchor)

        let rotation = Math.atan2(direction.y, direction.x);
        this.targetRotation = rotation + Math.PI * 5/2;
        this.baseRotation = rotation;

        this.sprite.anchor.set(1, 0.25)

        // Vérifie si on est dans la moitié gauche du cercle

    }
    stop(): void {
        if (this.baseX == undefined || this.baseY == undefined)
            throw new Error("Shouldn't be undefined.")
        this.effect.visible = false;
        this.sprite.x = this.baseX;
        this.sprite.y = this.baseY;
        this.sprite.anchor.copyFrom(this.baseAnchor);
    }
    update(delta: number): void {
        if (!this.targetRotation || !this.baseRotation || this.baseX == undefined || this.baseY == undefined)
            return;
        if (this.sprite.rotation > this.targetRotation){
            
            this.inverseRotation = true;
        }
        if(this.inverseRotation){
        
            this.sprite.rotation -= 0.05;
            return;
        }
           
        this.progress += delta / this.duration;


        let normalizedRotation = this.sprite.rotation % Math.PI*2;

        if(this.progress < 0.3){
            this.sprite.x = this.lerp(0,-8,this.progress*3.33)
            this.sprite.y = -5
            return;
        }

        if(this.progress >= 0.66 && this.progress <= 0.8){
            const t = (this.progress - 0.66) / (0.8 - 0.66);
            this.sprite.rotation = this.lerp(this.baseRotation + Math.PI*2, this.baseRotation + Math.PI*3,t);
            this.sprite.x = this.baseX;
            this.sprite.anchor.set(1,0.5);
            return;
        }

        if(this.progress > 0.3 && this.progress < 0.66){
            this.sprite.y = Math.sin(normalizedRotation) * -5;
            const t = (this.progress - 0.3) / (0.66 - 0.3);
            this.sprite.rotation = this.lerp(0,this.baseRotation + Math.PI*2,t)
            return;
        }
        
        else {
            
        }
        
        let distFrom2PI = Math.abs(this.sprite.rotation - (this.baseRotation + Math.PI * 2));


        let factor;
        if (distFrom2PI > 4 * Math.PI / 4) {
            // 0.3 à 0.65
            factor = 0.9;
        } else {
            // progress = 0.67
            
            const flipX = this.baseRotation > Math.PI / 2 || this.baseRotation < -Math.PI / 2;

            if (flipX) {
                this.effect.scale.x = -1;           // Flip horizontal
                this.baseRotation += Math.PI;           // Ajuste la rotation (retourne le sprite)
            } else {
                this.effect.scale.x = 1;
            }

            this.effect.animationSpeed = 0.5;
            this.effect.visible = true;
            this.effect.loop = false;
            this.effect.currentFrame = 0;
            this.effect.rotation = this.baseRotation;

            this.effect.play();
            factor = 4;
        }
        this.sprite.rotation += Math.PI / 13 * delta * factor;
        // this.sprite.scale.y = Math.max(1, 2 - 0.5 * Math.abs(distFrom2PI));

    }
    setDirection(_dir: Direction): void {

    }

    /**
     * 
     * @param a Source
     * @param b Dest
     * @param t [0,1]
     * @returns 
     */
    private lerp(a:number, b:number, t:number):number{
        return a+(b-a)*t;
    }

}