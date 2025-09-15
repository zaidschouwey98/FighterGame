import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "./IWeaponAnim";
import { Direction } from "../../../../../shared/Direction";

export class DashWeaponAnim implements IWeaponAnim {
    private progress = 0;
    private baseY = 0;
    private rotation = 0;
    private targetRotation = 0;
    private direction: Direction = Direction.RIGHT;
    private steps = 3; // Nombre de crans

    constructor(private sprite: Sprite) {
        this.baseY = sprite.y;
    }

    setDirection(direction: Direction) {
        this.direction = direction;
        this.setTargetRotation();
    }

    play() {
        this.sprite.visible = true;
        this.progress = 0;
        this.rotation = 0;
        this.setTargetRotation();
    }

    stop() {
        this.sprite.rotation = 0;
        this.sprite.y = this.baseY;
    }

    private setTargetRotation() {
        switch (this.direction) {
            case Direction.RIGHT:
                this.targetRotation = Math.PI * 0.25; // arme monte à droite
                break;
            case Direction.LEFT:
                this.targetRotation = -Math.PI * 0.25;  // arme monte à gauche
                break;
            case Direction.TOP:
                this.targetRotation = -Math.PI * 0.15; // légère rotation
                break;
            case Direction.BOTTOM:
                this.targetRotation = Math.PI * 0.15;  // légère rotation
                break;
        }
    }


    update(delta = 1) {
        // Avance le temps linéairement
        this.progress = Math.min(1, this.progress + delta * 0.1);

        const rawRotation = this.targetRotation * this.progress;


        const stepSize = this.targetRotation / this.steps;
        this.rotation = Math.round(rawRotation / stepSize) * stepSize;

        this.sprite.rotation = this.rotation;
        this.sprite.y = this.baseY;
    }
}
