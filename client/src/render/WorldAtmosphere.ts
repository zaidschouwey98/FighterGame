import { AdjustmentFilter, GodrayFilter } from "pixi-filters";
import { ColorMatrixFilter, Container } from "pixi.js";

/**
 * Ambiance mondiale : grade + godrays (pas de lumière directionnelle shader).
 * Appliqué aux couches monde (pas l'UI).
 */
export class WorldAtmosphere {
    private godray: GodrayFilter;
    private grade: AdjustmentFilter;
    private warmLift: ColorMatrixFilter;
    private time = 0;

    /** Angle soleil partagé (degrés) — herbe / ombres peuvent l'exploiter */
    lightAngle = 28;

    constructor(private worldRoot: Container) {
        this.godray = new GodrayFilter({
            angle: this.lightAngle,
            gain: 0.32,
            lacunarity: 2.4,
            parallel: true,
            time: 0,
            alpha: 0.2,
        });

        this.grade = new AdjustmentFilter({
            brightness: 1.03,
            contrast: 1.1,
            saturation: 1.18,
            gamma: 0.98,
            red: 1.02,
            green: 1.04,
            blue: 0.96,
        });

        this.warmLift = new ColorMatrixFilter();
        this.warmLift.matrix = [
            1.02, 0.03, 0.0, 0, 0.01,
            0.02, 1.05, 0.02, 0, 0.01,
            0.0, 0.03, 0.98, 0, 0.0,
            0, 0, 0, 1, 0,
        ];

        this.worldRoot.filters = [
            this.grade,
            this.warmLift,
            this.godray,
        ];
    }

    /** delta normalisé (style ticker ≈ 1 à 60 FPS) */
    update(delta: number) {
        this.time += delta * 0.02;
        this.lightAngle = 26 + Math.sin(this.time * 0.15) * 8;
        this.godray.time = this.time;
        this.godray.angle = this.lightAngle;
    }
}
