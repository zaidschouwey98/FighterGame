import { AnimatedSprite, type Container, type Spritesheet } from "pixi.js";
import type { EntityInfo } from "../../../shared/EntityInfo";
import type { EntitySprite } from "./EntitySprite";
import type { ProjectileInfo } from "../../../shared/player/weapons/projectiles/ProjectileInfo";
import { findAnimation } from "../AssetLoader";

export class ProjectileSprite implements EntitySprite {
    constructor(
        private objectContainer: Container,
        spriteSheets: Spritesheet[],
    ) {
        const fireball = new AnimatedSprite(findAnimation(spriteSheets, "fireball")!);
        fireball.anchor.set(0.5);
        fireball.loop = true;
        objectContainer.addChild(fireball);
    }

    public syncPlayer(entity: ProjectileInfo, onDeath?: () => void) {
       
    }

    public update(delta: number) {
        
    }
}