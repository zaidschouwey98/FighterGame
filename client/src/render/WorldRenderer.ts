import { Container, Sprite, Spritesheet } from "pixi.js";
import seedrandom from "seedrandom";
import * as Simplex from "simplex-noise";
import type Position from "../../../shared/Position";
import { findTexture, type TextureName } from "../AssetLoader";
import { MAP_FREQUENCY, TILE_SIZE } from "../constantes";


export class WorldRenderer {
    private _tilesContainer:Container;
    private _terrainContainer: Container;
    private _objectContainer: Container;
    private seed: string;
    private rng: seedrandom.PRNG;
    private noiseFunc: Simplex.NoiseFunction2D;
    private spritesheets: Spritesheet[];

    constructor(seed: string, spriteSheets:Spritesheet[], tilesContainer:Container, terrainContainer:Container, objectContainer:Container) {
        this.spritesheets = spriteSheets;
        this.seed = seed;
        this.rng = seedrandom(seed);
        this.noiseFunc = Simplex.createNoise2D(this.rng);

        this._objectContainer = objectContainer;
        this._terrainContainer = terrainContainer;
        this._tilesContainer = tilesContainer;
        
    }

    /** Pas de gameplay, mais tu pourrais bouger la caméra ici */
    public update(newPlayerPosition: Position) {
        this.generateChunk(0,0,8);
    }

    private generateChunk(cx: number, cy: number, size: number) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const absX = cx * size + x;
                const absY = cy * size + y;
                const noise = this.noiseFunc(absX * MAP_FREQUENCY, absY * MAP_FREQUENCY);

                // Choisir une texture selon la valeur du bruit
                let textureName: TextureName;
                if (noise < -0.3) textureName = "forest_center_1";
                else if (noise < 0.3) textureName = "grass_1";
                else textureName = "stone";

                const texture = findTexture(this.spritesheets, textureName);
                if (!texture) continue;

                const sprite = new Sprite(texture);
                sprite.x = absX * TILE_SIZE;
                sprite.y = absY * TILE_SIZE;
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;

                this._tilesContainer.addChild(sprite);
            }
        }
    }
}
