import { Container, Sprite, Spritesheet, Texture } from "pixi.js";
import seedrandom from "seedrandom";
import * as Simplex from "simplex-noise";
import { findTexture, type TextureName } from "../AssetLoader";
import { CHUNK_SIZE, MAP_FREQUENCY, RENDER_DISTANCE, TILE_SIZE } from "../../../shared/constantes";

type ChunkLayer = {
    ground: Sprite[];
    props: Sprite[];
    grass: GrassBlade[];
};

/** Touffe d'herbe haute interactive (vent + passage joueur) */
type GrassBlade = {
    sprite: Sprite;
    baseScaleX: number;
    baseScaleY: number;
    /** phase individuelle (micro-offset) */
    phase: number;
    /** phase de groupe pour vent cohérent au sein d'un patch */
    groupPhase: number;
    stiffness: number;
    skew: number;
    squash: number;
};

const GRASS: TextureName[] = ["grass_1", "grass_2", "grass_3", "grass_4"];
const FOREST_BODY: TextureName[] = ["forest_center_1", "forest_center_2"];
const TREES: TextureName[] = ["tree_1", "tree_2", "tree_3", "tree_4"];
const FLOWERS: TextureName[] = ["flower_1", "flower_2", "flower_3"];
const BUSHES: TextureName[] = ["bush_1", "bush_2", "bush_3"];
const TALL_GRASS: TextureName[] = ["tall_grass_1", "tall_grass_2", "tall_grass_3"];

const GRASS_INFLUENCE = 28;
const GRASS_MAX_LEAN = 0.62;
/** Taille grille des patches (tiles) — même groupe = même phase de vent */
const GRASS_GROUP_SIZE = 5;
/** Fréquence bruit des champs : plus bas = plus grands patches */
const TALL_GRASS_FIELD_FREQ = 0.025;
/** Seuil d'entrée dans un champ (bruit -1..1) */
const TALL_GRASS_FIELD_THRESHOLD = -0.05;

function hash2(x: number, y: number, salt = 0): number {
    let n = (x * 374761393 + y * 668265263 + salt * 1274126177) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function pick<T>(arr: T[], t: number): T {
    const u = ((t % 1) + 1) % 1;
    const i = Math.min(arr.length - 1, Math.floor(u * arr.length));
    return arr[i];
}

export class WorldRenderer {
    private _tilesContainer: Container;
    private _terrainContainer: Container;

    private _loadedChunks: Map<string, ChunkLayer> = new Map();
    private _allGrass: GrassBlade[] = [];

    private noiseFunc: Simplex.NoiseFunction2D;
    private detailNoise: Simplex.NoiseFunction2D;
    private spritesheets: Spritesheet[];
    private time = 0;

    constructor(
        seed: string,
        spriteSheets: Spritesheet[],
        tilesContainer: Container,
        terrainContainer: Container,
        _objectContainer: Container,
    ) {
        this.spritesheets = spriteSheets;
        this.noiseFunc = Simplex.createNoise2D(seedrandom(seed));
        this.detailNoise = Simplex.createNoise2D(seedrandom(seed + "_detail"));

        this._terrainContainer = terrainContainer;
        this._tilesContainer = tilesContainer;
        this._terrainContainer.sortableChildren = true;
    }

    public updateChunks(cx: number, cy: number) {
        const visibleChunks = new Set<string>();

        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
                const chunkX = cx + dx;
                const chunkY = cy + dy;
                const key = `${chunkX}_${chunkY}`;
                visibleChunks.add(key);
                this.generateChunk(chunkX, chunkY, CHUNK_SIZE);
            }
        }

        for (const [key, layer] of this._loadedChunks) {
            if (!visibleChunks.has(key)) {
                this.destroyChunk(layer);
                this._loadedChunks.delete(key);
            }
        }

        this.rebuildGrassIndex();
    }

    public update(cx: number, cy: number) {
        this.updateChunks(cx, cy);
    }

    public updateInteractive(
        delta: number,
        player?: { x: number; y: number; vx?: number; vy?: number } | null,
    ) {
        this.time += delta * 0.08;
        const px = player?.x;
        const py = player?.y;
        const pvx = player?.vx ?? 0;
        const pvy = player?.vy ?? 0;
        const moving = Math.hypot(pvx, pvy) > 0.05;

        for (const blade of this._allGrass) {
            const s = blade.sprite;
            // Vent de groupe (cohérent) + micro variation par brin
            const wind =
                Math.sin(this.time * 0.9 + blade.groupPhase) * 0.14
                + Math.sin(this.time * 1.35 + blade.phase) * 0.05
                + Math.sin(this.time * 0.35 + blade.groupPhase * 0.5) * 0.04;

            let push = 0;
            let trample = 0;

            if (px !== undefined && py !== undefined) {
                const dx = s.x - px;
                const dy = s.y - py;
                const dist = Math.hypot(dx, dy);
                if (dist < GRASS_INFLUENCE && dist > 0.1) {
                    const falloff = 1 - dist / GRASS_INFLUENCE;
                    const falloff2 = falloff * falloff;
                    const awayX = dx / dist;
                    const leanDir = awayX + pvx * 0.2;
                    push = leanDir * falloff2 * GRASS_MAX_LEAN * (moving ? 1.35 : 0.9);
                    trample = falloff2 * (moving ? 0.22 : 0.1);
                }
            }

            const targetSkew = wind + push;
            const targetSquash = 1 - trample;
            const k = 1 - Math.pow(1 - blade.stiffness, delta);
            blade.skew += (targetSkew - blade.skew) * k;
            blade.squash += (targetSquash - blade.squash) * k;

            s.skew.x = blade.skew;
            s.scale.y = blade.baseScaleY * blade.squash;
            const squashX = 1 + (1 - blade.squash) * 0.4;
            s.scale.x = blade.baseScaleX * squashX;
        }
    }

    private rebuildGrassIndex() {
        this._allGrass = [];
        for (const layer of this._loadedChunks.values()) {
            this._allGrass.push(...layer.grass);
        }
    }

    private destroyChunk(layer: ChunkLayer) {
        for (const s of layer.ground) {
            s.parent?.removeChild(s);
            s.destroy();
        }
        for (const s of layer.props) {
            s.parent?.removeChild(s);
            s.destroy();
        }
        for (const g of layer.grass) {
            g.sprite.parent?.removeChild(g.sprite);
            g.sprite.destroy();
        }
    }

    private sampleBiome(absX: number, absY: number) {
        const f = MAP_FREQUENCY;
        const base = this.noiseFunc(absX * f, absY * f);
        const detail = this.detailNoise(absX * f * 2.4 + 40, absY * f * 2.4 - 12) * 0.35;
        const ridge = this.noiseFunc(absX * f * 0.45 + 200, absY * f * 0.45) * 0.2;
        const value = base + detail + ridge;
        const isForest = value < -0.32;
        // Champ d'herbes hautes — patches larges (basse fréquence)
        const tallField =
            this.detailNoise(absX * TALL_GRASS_FIELD_FREQ + 90, absY * TALL_GRASS_FIELD_FREQ - 40) * 0.75
            + this.detailNoise(absX * TALL_GRASS_FIELD_FREQ * 2.2 + 12, absY * TALL_GRASS_FIELD_FREQ * 2.2) * 0.25;
        return { value, isForest, detail, tallField };
    }

    private chooseGroundTexture(absX: number, absY: number, isForest: boolean, value: number, detail: number): TextureName {
        const v = hash2(absX, absY, 7);
        if (isForest) {
            if (value > -0.4 && v > 0.55) {
                return pick(["forest_edge_1", "forest_edge_2", "forest_edge_3"] as TextureName[], v);
            }
            return pick(FOREST_BODY, v);
        }
        if (v > 0.92) return pick(GRASS, hash2(absX, absY, 3));
        if (detail > 0.15) return "grass_3";
        if (detail < -0.2) return "grass_4";
        return pick(GRASS, v);
    }

    private tintForTile(sprite: Sprite, isForest: boolean, absX: number, absY: number) {
        const t = hash2(absX, absY, 99);
        if (isForest) {
            sprite.tint = t > 0.5 ? 0xc8e0c0 : 0xb0d0b8;
        } else {
            const shades = [0xffffff, 0xf5ffe8, 0xe8f8d8, 0xfff6e0, 0xe0f0d0];
            sprite.tint = shades[Math.floor(t * shades.length) % shades.length];
        }
    }

    private tryAddProp(
        props: Sprite[],
        name: TextureName,
        absX: number,
        absY: number,
        opts: { anchorY?: number; scale?: number; alpha?: number; zBoost?: number } = {},
    ) {
        const tex = findTexture(this.spritesheets, name);
        if (!tex) return;
        const s = new Sprite(tex);
        const scale = opts.scale ?? 1;
        s.anchor.set(0.5, opts.anchorY ?? 1);
        s.scale.set(scale);
        s.x = absX * TILE_SIZE + TILE_SIZE / 2 + (hash2(absX, absY, 11) - 0.5) * 6;
        s.y = absY * TILE_SIZE + TILE_SIZE * (opts.anchorY === 0.5 ? 0.5 : 0.85);
        s.alpha = opts.alpha ?? 1;
        s.zIndex = Math.round(s.y) + (opts.zBoost ?? 0);
        if (hash2(absX, absY, 55) > 0.5) s.scale.x *= -1;
        props.push(s);
        this._terrainContainer.addChild(s);
    }

    private getTallGrassTexture(variant: number): Texture | undefined {
        const name = pick(TALL_GRASS, variant);
        return findTexture(this.spritesheets, name);
    }

    private tryAddTallGrass(
        grass: GrassBlade[],
        absX: number,
        absY: number,
        slot: number,
        groupPhase: number,
        ox?: number,
        oy?: number,
    ) {
        const h = hash2(absX, absY, 200 + slot);
        const h2 = hash2(absX, absY, 300 + slot);
        const tex = this.getTallGrassTexture(h);
        if (!tex) return;

        const s = new Sprite(tex);
        s.anchor.set(0.5, 1);
        const flip = h2 > 0.5 ? -1 : 1;
        const baseScaleY = 0.95 + h2 * 0.25;
        const baseScaleX = (0.9 + h * 0.25) * flip;
        s.scale.set(baseScaleX, baseScaleY);

        const jx = ox ?? TILE_SIZE * (0.2 + hash2(absX, absY, 400 + slot) * 0.6);
        const jy = oy ?? TILE_SIZE * (0.55 + hash2(absX, absY, 500 + slot) * 0.4);
        s.x = absX * TILE_SIZE + jx;
        s.y = absY * TILE_SIZE + jy;
        s.zIndex = Math.round(s.y);
        s.tint = pick([0xffffff, 0xf0ffe8, 0xe8f8d0, 0xf8fff0], h);

        grass.push({
            sprite: s,
            baseScaleX,
            baseScaleY,
            phase: h * Math.PI * 2,
            groupPhase,
            stiffness: 0.14 + h2 * 0.12,
            skew: 0,
            squash: 1,
        });
        this._terrainContainer.addChild(s);
    }

    /** Bouquet de brins (même phase de vent) */
    private placeTallGrassCluster(
        grass: GrassBlade[],
        absX: number,
        absY: number,
        strength: number,
    ) {
        const gx = Math.floor(absX / GRASS_GROUP_SIZE);
        const gy = Math.floor(absY / GRASS_GROUP_SIZE);
        const groupPhase = hash2(gx, gy, 77) * Math.PI * 2;

        const count = 4 + Math.floor(strength * 5);
        for (let i = 0; i < count; i++) {
            const ox = TILE_SIZE * (0.1 + hash2(absX, absY, 800 + i) * 0.8);
            const oy = TILE_SIZE * (0.45 + hash2(absX, absY, 900 + i) * 0.5);
            this.tryAddTallGrass(grass, absX, absY, i, groupPhase, ox, oy);
        }

        // Extension du bouquet sur voisins → champs plus continus
        if (hash2(absX, absY, 66) < 0.55 * strength) {
            this.tryAddTallGrass(grass, absX + 1, absY, 10, groupPhase);
        }
        if (hash2(absX, absY, 67) < 0.5 * strength) {
            this.tryAddTallGrass(grass, absX, absY + 1, 11, groupPhase);
        }
        if (hash2(absX, absY, 68) < 0.4 * strength) {
            this.tryAddTallGrass(grass, absX - 1, absY, 12, groupPhase);
        }
        if (hash2(absX, absY, 69) < 0.4 * strength) {
            this.tryAddTallGrass(grass, absX, absY - 1, 13, groupPhase);
        }
    }

    private generateChunk(cx: number, cy: number, size: number) {
        const key = `${cx}_${cy}`;
        if (this._loadedChunks.has(key)) return;

        const ground: Sprite[] = [];
        const props: Sprite[] = [];
        const grass: GrassBlade[] = [];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const absX = cx * size + x;
                const absY = cy * size + y;
                const { value, isForest, detail, tallField } = this.sampleBiome(absX, absY);
                const textureName = this.chooseGroundTexture(absX, absY, isForest, value, detail);
                const texture =
                    findTexture(this.spritesheets, textureName)
                    ?? findTexture(this.spritesheets, "grass_1");
                if (!texture) continue;

                const sprite = new Sprite(texture);
                sprite.x = absX * TILE_SIZE;
                sprite.y = absY * TILE_SIZE;
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;
                this.tintForTile(sprite, isForest, absX, absY);
                ground.push(sprite);
                this._tilesContainer.addChild(sprite);

                this.scatterDecor(props, grass, absX, absY, isForest, value, tallField);
            }
        }

        this._loadedChunks.set(key, { ground, props, grass });
    }

    private scatterDecor(
        props: Sprite[],
        grass: GrassBlade[],
        absX: number,
        absY: number,
        isForest: boolean,
        biomeValue: number,
        tallField: number,
    ) {
        const h = hash2(absX, absY, 1);
        const h2 = hash2(absX, absY, 2);
        const h3 = hash2(absX, absY, 3);

        if (isForest) {
            if (h < 0.07) {
                this.tryAddProp(props, pick(TREES, h2), absX, absY, {
                    anchorY: 1,
                    scale: 0.9 + h3 * 0.35,
                    zBoost: 2,
                });
            } else if (h < 0.1) {
                this.tryAddProp(props, pick(BUSHES, h2), absX, absY, {
                    anchorY: 1,
                    scale: 0.85 + h3 * 0.2,
                    alpha: 0.95,
                });
            }
            return;
        }

        // Herbes hautes en grands champs
        if (tallField > TALL_GRASS_FIELD_THRESHOLD) {
            const strength = Math.min(
                1,
                (tallField - TALL_GRASS_FIELD_THRESHOLD) / (0.85 - TALL_GRASS_FIELD_THRESHOLD),
            );
            // Bouquets plus fréquents au cœur du champ
            const seedChance = 0.1 + strength * 0.22;
            if (h < seedChance) {
                this.placeTallGrassCluster(grass, absX, absY, strength);
            } else if (h2 < 0.18 + strength * 0.28) {
                // Remplissage : brins entre les bouquets pour un vrai tapis
                const gx = Math.floor(absX / GRASS_GROUP_SIZE);
                const gy = Math.floor(absY / GRASS_GROUP_SIZE);
                const groupPhase = hash2(gx, gy, 77) * Math.PI * 2;
                this.tryAddTallGrass(grass, absX, absY, 0, groupPhase);
                if (h3 < 0.35 * strength) {
                    this.tryAddTallGrass(grass, absX, absY, 1, groupPhase);
                }
            }
        }

        if (h < 0.012) {
            this.tryAddProp(props, pick(FLOWERS, h2), absX, absY, {
                anchorY: 1,
                scale: 0.9 + h3 * 0.25,
            });
        } else if (h < 0.022) {
            this.tryAddProp(props, pick(BUSHES, h2), absX, absY, {
                anchorY: 1,
                scale: 0.75 + h3 * 0.2,
            });
        } else if (h < 0.028 && biomeValue > 0.4) {
            this.tryAddProp(props, pick(TREES, h2), absX, absY, {
                anchorY: 1,
                scale: 0.85 + h3 * 0.2,
                alpha: 0.95,
                zBoost: 2,
            });
        }
    }
}
