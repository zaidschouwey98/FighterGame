import { AnimatedSprite, type Container, type Spritesheet } from "pixi.js";
import type { EntitySprite } from "./EntitySprite";
import type { ProjectileInfo } from "../../../shared/player/weapons/projectiles/ProjectileInfo";
import { findAnimation } from "../AssetLoader";

export class ProjectileSprite implements EntitySprite {
    constructor(
        projectileDir:number,
        projectileContainer: Container,
        spriteSheets: Spritesheet[],
    ) {
        const fireball = new AnimatedSprite(findAnimation(spriteSheets, "fireball")!);
        fireball.anchor.set(0.5);
        fireball.loop = true;
        fireball.rotation = projectileDir;
        fireball.play()
        projectileContainer.addChild(fireball);
    }

    public syncPlayer(_entity: ProjectileInfo, onDeath?: () => void) {
       onDeath && onDeath();
    }

    public update(_delta: number) {
        
    }
}