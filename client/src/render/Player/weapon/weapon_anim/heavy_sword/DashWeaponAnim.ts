import { Sprite } from "pixi.js";
import type { IWeaponAnim } from "../IWeaponAnim";
import { Direction } from "../../../../../../../shared/Direction";
import AnimHelper from "../../../../../helper/AnimHelper";

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

    play(direction: { x: number, y: number } = { x: 0, y: 0 }) {
        const rot = Math.atan2(direction.y,direction.x);
        const flipX = rot > Math.PI / 2 || rot< -Math.PI / 2;
        this.sprite.scale.x = flipX ? -1 : 1;
        this.direction = AnimHelper.getDirectionByVector(direction,[Direction.LEFT, Direction.RIGHT]);
        this.setTargetRotation();

        this.sprite.visible = true;
        this.progress = 0;
        this.rotation = 0;
    }

    stop() {
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
        this.progress = Math.min(1, this.progress + delta * 0.1);

        const rawRotation = this.targetRotation * this.progress;


        const stepSize = this.targetRotation / this.steps;
        this.rotation = Math.round(rawRotation / stepSize) * stepSize;

        this.sprite.rotation = this.rotation;
        this.sprite.y = this.baseY;
    }
}
