import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";
import { findAnimation } from "../../../../../AssetLoader";

export class HeavySwordAttack2 implements IWeaponAnim {
    private sprite: AnimatedSprite;

    constructor(staticEffectContainer:Container, spriteSheets:Spritesheet[]){
        this.sprite = new AnimatedSprite(findAnimation(spriteSheets, "player_attack_effect_right_2")!);
        staticEffectContainer.addChild(this.sprite);
    }
    play(direction:{x:number,y:number} = {x:0,y:0}): void {
        let rotation = Math.atan2(direction.y, direction.x);

        // Vérifie si on est dans la moitié gauche du cercle
        const flipX = rotation > Math.PI / 2 || rotation < -Math.PI / 2;

        if (flipX) {
            this.sprite.scale.x = -1;           // Flip horizontal
            rotation += Math.PI;           // Ajuste la rotation (retourne le sprite)
        } else {
            this.sprite.scale.x = 1;
        }

        this.sprite.animationSpeed = 0.4;
        this.sprite.visible = true;
        this.sprite.loop = false;
        this.sprite.currentFrame = 0;
        this.sprite.rotation = rotation;

        this.sprite.play();
        this.sprite.onComplete = () => {
            this.sprite.visible = false;
        };
    }
    stop(): void {
        
    }
    update(_delta: number): void {
        
    }
    setDirection(_dir: Direction): void {
        
    }
    
}