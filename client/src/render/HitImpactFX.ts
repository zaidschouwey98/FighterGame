import { Container, Graphics } from "pixi.js";
import { ENTITY_DEPTH_FOOT_OFFSET } from "../../../shared/constantes";

type Spark = {
    g: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
};

type Ring = {
    g: Graphics;
    life: number;
    maxLife: number;
    color: number;
    maxR: number;
};

type Droplet = {
    g: Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    groundY: number;
    size: number;
    color: number;
};

type Stain = {
    g: Graphics;
    life: number;
    maxLife: number;
    peakAlpha: number;
};

const BLOOD_COLORS = [0x8b0a1a, 0xa31224, 0x6e0814, 0xc41e3a, 0x4a050c] as const;
const MAX_STAINS = 90;

/**
 * Hit sparks + blood: airborne droplets + lasting floor stains (under feet).
 */
export class HitImpactFX {
    private airRoot: Container;
    private groundRoot: Container;
    private sparks: Spark[] = [];
    private rings: Ring[] = [];
    private droplets: Droplet[] = [];
    private stains: Stain[] = [];

    constructor(airParent: Container, groundParent: Container) {
        this.airRoot = new Container({ label: "hit_impact_air" });
        this.groundRoot = new Container({ label: "hit_impact_ground" });
        airParent.addChild(this.airRoot);
        // Under depth/entities: stains sit on floor
        groundParent.addChild(this.groundRoot);
    }

    play(x: number, y: number, isCrit: boolean) {
        this.playSparks(x, y, isCrit);
        this.playBlood(x, y, isCrit);
    }

    private playSparks(x: number, y: number, isCrit: boolean) {
        const n = isCrit ? 14 : 8;
        const speed = isCrit ? 2.8 : 1.9;
        const color = isCrit ? 0xffe066 : 0xfff4e0;
        const secondary = isCrit ? 0xff5533 : 0xffaa66;

        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
            const sp = speed * (0.55 + Math.random() * 0.7);
            const g = new Graphics();
            const len = isCrit ? 5 + Math.random() * 4 : 3 + Math.random() * 3;
            g.moveTo(0, 0);
            g.lineTo(len, 0);
            g.stroke({ width: isCrit ? 1.4 : 1, color: Math.random() > 0.35 ? color : secondary, alpha: 1 });
            g.rotation = angle;
            g.x = x;
            g.y = y;
            this.airRoot.addChild(g);
            this.sparks.push({
                g,
                vx: Math.cos(angle) * sp,
                vy: Math.sin(angle) * sp,
                life: 0,
                maxLife: 8 + Math.random() * 6 + (isCrit ? 4 : 0),
            });
        }

        const core = new Graphics().circle(0, 0, isCrit ? 5 : 3).fill({ color: 0xffffff, alpha: 0.85 });
        core.x = x;
        core.y = y;
        this.airRoot.addChild(core);
        this.sparks.push({ g: core, vx: 0, vy: 0, life: 0, maxLife: 4 });

        this.spawnRing(x, y, isCrit ? 0xffcc44 : 0xffffff, isCrit ? 22 : 14, isCrit ? 12 : 8);
        if (isCrit) {
            this.spawnRing(x, y, 0xff4422, 28, 14);
        }
    }

    private playBlood(hitX: number, hitY: number, isCrit: boolean) {
        const groundY = hitY + ENTITY_DEPTH_FOOT_OFFSET * 0.55;
        const dropCount = isCrit ? 12 : 7;
        const stainBurst = isCrit ? 5 : 3;

        // Immediate puddle under the body
        for (let i = 0; i < stainBurst; i++) {
            const ox = (Math.random() - 0.5) * (isCrit ? 18 : 12);
            const oy = (Math.random() - 0.5) * 4;
            this.spawnStain(hitX + ox, groundY + oy, {
                scale: isCrit ? 1.8 : 1.25,
                peakAlpha: 0.72 + Math.random() * 0.2,
            });
        }

        // Flying droplets → land → stain
        for (let i = 0; i < dropCount; i++) {
            const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.3;
            const speed = (isCrit ? 1.6 : 1.1) * (0.5 + Math.random());
            const size = 0.8 + Math.random() * (isCrit ? 2.2 : 1.4);
            const color = BLOOD_COLORS[(Math.random() * BLOOD_COLORS.length) | 0];
            const g = new Graphics().circle(0, 0, size).fill({ color, alpha: 0.95 });
            const x = hitX + (Math.random() - 0.5) * 4;
            const y = hitY + (Math.random() - 0.5) * 3;
            g.x = x;
            g.y = y;
            this.airRoot.addChild(g);
            this.droplets.push({
                g,
                x,
                y,
                vx: Math.cos(angle) * speed * 1.2,
                vy: Math.sin(angle) * speed - 0.4 - Math.random() * 0.6,
                groundY: groundY + (Math.random() - 0.5) * 6,
                size,
                color,
            });
        }
    }

    private spawnStain(x: number, y: number, opts: { scale: number; peakAlpha: number }) {
        while (this.stains.length >= MAX_STAINS) {
            const old = this.stains.shift()!;
            old.g.destroy();
        }

        const g = new Graphics();
        const rx = (2.5 + Math.random() * 4) * opts.scale;
        const ry = (1.2 + Math.random() * 1.8) * opts.scale;
        const color = BLOOD_COLORS[(Math.random() * BLOOD_COLORS.length) | 0];
        const rot = (Math.random() - 0.5) * 0.8;

        // Main blob + 1-2 satellite drips for organic look
        g.ellipse(0, 0, rx, ry).fill({ color, alpha: 1 });
        const satellites = 1 + ((Math.random() * 2) | 0);
        for (let i = 0; i < satellites; i++) {
            const sx = (Math.random() - 0.5) * rx * 1.6;
            const sy = (Math.random() - 0.5) * ry * 1.2;
            g.ellipse(sx, sy, rx * (0.25 + Math.random() * 0.35), ry * (0.3 + Math.random() * 0.3))
                .fill({ color: BLOOD_COLORS[(Math.random() * BLOOD_COLORS.length) | 0], alpha: 1 });
        }

        g.rotation = rot;
        g.x = x;
        g.y = y;
        g.alpha = opts.peakAlpha;
        this.groundRoot.addChild(g);

        // ~8–14s on ground at 60fps tick
        const maxLife = 480 + Math.random() * 360;
        this.stains.push({ g, life: 0, maxLife, peakAlpha: opts.peakAlpha });
    }

    private spawnRing(x: number, y: number, color: number, maxR: number, life: number) {
        const g = new Graphics();
        g.x = x;
        g.y = y;
        this.airRoot.addChild(g);
        this.rings.push({ g, life: 0, maxLife: life, color, maxR });
    }

    update(delta: number) {
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.life += delta;
            s.g.x += s.vx * delta;
            s.g.y += s.vy * delta;
            s.vx *= 0.92;
            s.vy *= 0.92;
            const t = s.life / s.maxLife;
            s.g.alpha = 1 - t;
            if (s.life >= s.maxLife) {
                s.g.destroy();
                this.sparks.splice(i, 1);
            }
        }

        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            r.life += delta;
            const t = Math.min(1, r.life / r.maxLife);
            const radius = 2 + t * r.maxR;
            r.g.clear();
            r.g.circle(0, 0, radius).stroke({
                width: 1.2 * (1 - t * 0.6),
                color: r.color,
                alpha: (1 - t) * 0.9,
            });
            if (r.life >= r.maxLife) {
                r.g.destroy();
                this.rings.splice(i, 1);
            }
        }

        // Blood in air → splash on ground
        const gravity = 0.22;
        for (let i = this.droplets.length - 1; i >= 0; i--) {
            const d = this.droplets[i];
            d.vy += gravity * delta;
            d.x += d.vx * delta;
            d.y += d.vy * delta;
            d.g.x = d.x;
            d.g.y = d.y;
            // Stretch while flying
            const speed = Math.hypot(d.vx, d.vy);
            d.g.scale.set(1, 1 + Math.min(1.2, speed * 0.15));
            d.g.rotation = Math.atan2(d.vy, d.vx);

            if (d.y >= d.groundY && d.vy > 0) {
                this.spawnStain(d.x, d.groundY, {
                    scale: 0.7 + d.size * 0.45,
                    peakAlpha: 0.55 + Math.random() * 0.3,
                });
                d.g.destroy();
                this.droplets.splice(i, 1);
            } else if (d.y > d.groundY + 40) {
                // safety
                d.g.destroy();
                this.droplets.splice(i, 1);
            }
        }

        // Stains fade slowly
        for (let i = this.stains.length - 1; i >= 0; i--) {
            const s = this.stains[i];
            s.life += delta;
            const t = s.life / s.maxLife;
            // Hold opaque-ish, then long fade
            if (t < 0.55) {
                s.g.alpha = s.peakAlpha;
            } else {
                s.g.alpha = s.peakAlpha * (1 - (t - 0.55) / 0.45);
            }
            if (s.life >= s.maxLife) {
                s.g.destroy();
                this.stains.splice(i, 1);
            }
        }
    }
}
