import { AnimatedSprite, Container, Point, Sprite, Spritesheet, type PointLike } from "pixi.js";
import type { Direction } from "../../../../../../../shared/Direction";
import type { IWeaponAnim } from "../IWeaponAnim";
import { findAnimation } from "../../../../../AssetLoader";

export class HeavySwordAttack2 implements IWeaponAnim {
    private sprite: Sprite;
    private effect: AnimatedSprite;

    private baseRotation?: number;

    private baseX?: number;
    private baseY?: number;
    private baseAnchor: PointLike = new Point();

    private duration: number = 40;
    private progress = 0; // entre 0 et 1

    private flipX: boolean = false;

    constructor(sprite: Sprite, playerContainer: Container, spriteSheets: Spritesheet[]) {
        this.sprite = sprite;
        this.effect = new AnimatedSprite(findAnimation(spriteSheets, "sword_1_attack_effect_right_1")!);
        this.effect.anchor.set(0.5);
        this.effect.visible = false;
        playerContainer.addChild(this.effect);
    }
    play(direction: { x: number, y: number } = { x: 0, y: 0 }): void {
        this.sprite.scale.y = -1;
        this.progress = 0;
        this.baseX = this.sprite.x;
        this.baseY = this.sprite.y;
        this.sprite.anchor.copyTo(this.baseAnchor)

        let rotation = Math.atan2(direction.y, direction.x);
        this.baseRotation = rotation;
        this.flipX = this.baseRotation > Math.PI / 2 || this.baseRotation < -Math.PI / 2;
        this.sprite.scale.x = this.flipX ? 1 : -1;
        this.sprite.anchor.set(1, 0.25)

    }
    stop(): void {
        if (this.baseX == undefined || this.baseY == undefined)
            throw new Error("Shouldn't be undefined.")
        this.effect.visible = false;
        this.sprite.x = this.baseX;
        this.sprite.y = this.baseY;
        this.sprite.rotation = 0;
        this.sprite.scale.x = this.flipX ? -1 : 1;
        this.sprite.anchor.copyFrom(this.baseAnchor);
    }
    update(delta: number): void {
        if (this.baseRotation == undefined || this.baseX == undefined || this.baseY == undefined) return;

        const dir = this.flipX ? -1 : 1;     // gauche/droite (miroir)
        const swing = -dir;                  // ✅ inverse le sens du slash pour les deux côtés

        this.progress += delta / this.duration;

        // petite correction au passage : modulo 2π (parenthèses)
        const normalizedRotation = this.sprite.rotation % (Math.PI * 2);

        if (this.progress < 0.3) {
            this.sprite.zIndex = -1;
            this.sprite.x = dir * this.lerp(0, -8, this.progress * 3.33);
            this.sprite.y = 6;
            return;
        }

        if (this.progress >= 0.9) {
            const t = (this.progress - 0.9) / 0.1;
            this.sprite.anchor.x = this.lerp(1, 0.92, t);
            this.sprite.rotation = this.lerp(swing * Math.PI * 11 / 4, swing * Math.PI * 3, t); // ⬅️ ici
            this.sprite.scale.y = 1;
        }

        if (this.progress >= 0.8 && this.progress < 0.9) {
            const t = (this.progress - 0.8) / 0.1;
            this.sprite.scale.y = this.lerp(2, 1, t);
        }

        if (this.progress >= 0.66 && this.progress < 0.8) {
            this.sprite.zIndex = 1;
            const t = (this.progress - 0.66) / 0.14;
            const easedT = (1 - Math.cos(Math.PI * t)) / 2;
            this.sprite.scale.y = Math.max(1, easedT * 2);
            this.sprite.anchor.y = this.lerp(0.25, 0.5, t);
            this.sprite.rotation = this.lerp(swing * Math.PI, swing * Math.PI * 11 / 4, easedT); // ⬅️ ici
            this.sprite.x = this.baseX;
            this.sprite.y = this.baseY;
            this.playEffect();
            return;
        }

        if (this.progress >= 0.3 && this.progress < 0.66) {
            this.sprite.y = Math.sin(normalizedRotation) * -5;
            const t = (this.progress - 0.3) / 0.36;
            this.sprite.rotation = this.lerp(0, swing * Math.PI, t); // ⬅️ ici
            return;
        }
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
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    private playEffect() {
        if (this.baseRotation == undefined || this.effect == undefined) return;

        if (this.flipX) {
            this.effect.scale.x = -1;           // Flip horizontal
                   // Ajuste la rotation (retourne le sprite)
        } else {
            this.effect.scale.x = 1;
        }

        this.effect.animationSpeed = 0.6;
        this.effect.visible = true;
        this.effect.loop = false;
        this.effect.currentFrame = 0;

        this.effect.rotation = this.flipX ? this.baseRotation! - Math.PI : this.baseRotation!;

        this.effect.play();
    }

}