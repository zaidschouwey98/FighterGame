import { HIT_SHAKE_CRIT, HIT_SHAKE_NORMAL, HITSTOP_CRIT, HITSTOP_NORMAL } from "../../../shared/constantes";

/**
 * Hitstop (freeze simulation) + camera shake for impact feedback.
 * Call process() each frame; use returned delta for sim, sampleShake for camera.
 */
export class HitFeelService {
    private hitstopLeft = 0;
    private shake = 0;
    private flash = 0;

    /** Strongest of overlapping hits wins / extends */
    onImpact(isCrit: boolean) {
        const stop = isCrit ? HITSTOP_CRIT : HITSTOP_NORMAL;
        const shake = isCrit ? HIT_SHAKE_CRIT : HIT_SHAKE_NORMAL;
        this.hitstopLeft = Math.max(this.hitstopLeft, stop);
        this.shake = Math.max(this.shake, shake);
        this.flash = Math.max(this.flash, isCrit ? 0.16 : 0.08);
    }

    /**
     * Advance hitstop; returns delta to use for gameplay sim (0 while frozen).
     * Flash/shake keep running so feedback stays alive during freeze.
     */
    process(delta: number): number {
        if (this.hitstopLeft > 0) {
            this.hitstopLeft = Math.max(0, this.hitstopLeft - delta);
            return 0;
        }
        return delta;
    }

    sampleShake(): { x: number; y: number } {
        if (this.shake < 0.08) {
            this.shake = 0;
            return { x: 0, y: 0 };
        }
        const angle = Math.random() * Math.PI * 2;
        const ox = Math.cos(angle) * this.shake;
        const oy = Math.sin(angle) * this.shake;
        this.shake *= 0.78;
        return { x: ox, y: oy };
    }

    /** Remaining white flash alpha (consume slightly each call) */
    sampleFlash(): number {
        if (this.flash <= 0.004) {
            this.flash = 0;
            return 0;
        }
        const a = this.flash;
        this.flash *= 0.72;
        return a;
    }

    get isFrozen(): boolean {
        return this.hitstopLeft > 0;
    }
}
