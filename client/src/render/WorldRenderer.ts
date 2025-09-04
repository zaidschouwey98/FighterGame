import { Container, Sprite, Spritesheet, tilingBit } from "pixi.js";
import seedrandom from "seedrandom";
import * as Simplex from "simplex-noise";
import type Position from "../../../shared/Position";
import { findTexture, type TextureName } from "../AssetLoader";
import { CHUNK_SIZE, MAP_FREQUENCY, RENDER_DISTANCE, TILE_SIZE } from "../constantes";


export class WorldRenderer {
    private _tilesContainer: Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;

    private _loadedChunks: Map<string, Sprite[]>;

    private seed: string;
    private rng: seedrandom.PRNG;
    private noiseFunc: Simplex.NoiseFunction2D;
    private spritesheets: Spritesheet[];

    constructor(seed: string, spriteSheets: Spritesheet[], tilesContainer: Container, terrainContainer: Container, objectContainer: Container) {
        this.spritesheets = spriteSheets;
        this.seed = seed;
        this.rng = seedrandom(seed);
        this.noiseFunc = Simplex.createNoise2D(this.rng);

        this._objectContainer = objectContainer;
        this._terrainContainer = terrainContainer;
        this._tilesContainer = tilesContainer;
        this._loadedChunks = new Map();

    }

    public update(cx: number, cy: number) {
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
                const chunkX = cx + dx;
                const chunkY = cy + dy;
                this.generateChunk(chunkX, chunkY, CHUNK_SIZE);
            }
        }
    }

    private generateChunk(cx: number, cy: number, size: number) {
        let chunkTextures: Sprite[] = [];
        if(this._loadedChunks.has(`${cx}_${cy}`)){
            // Chunk already loaded
            return;
        }
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const absX = cx * size + x;
                const absY = cy * size + y;
                const noise = this.noiseFunc(absX * MAP_FREQUENCY, absY * MAP_FREQUENCY);

                // Choisir une texture selon la valeur du bruit
                let textureName: TextureName;
                if (noise < -0.3) textureName = "forest_center_1";
                else if (noise < 0.3) textureName = "grass_1";
                else textureName = "grass_2";

                const texture = findTexture(this.spritesheets, textureName);
                if (!texture) continue;

                const sprite = new Sprite(texture);
                sprite.x = absX * TILE_SIZE;
                sprite.y = absY * TILE_SIZE;
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;
                chunkTextures.push(sprite);
                this._tilesContainer.addChild(sprite);
            }
        }

        this._loadedChunks.set(`${cx}_${cy}`,chunkTextures)
    }
}
