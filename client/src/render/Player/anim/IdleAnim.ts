import { AnimatedSprite, Sprite, Spritesheet } from "pixi.js";
import { Direction } from "../../../../../shared/Direction";
import type Player from "../../../core/player/Player";
import { findAnimation } from "../../../AssetLoader";

export class IdleAnim{
    private animations:Map<Direction,AnimatedSprite> = new Map();
    constructor(spriteSheets:Spritesheet[]){
        this.animations.set(Direction.BOTTOM, new AnimatedSprite(findAnimation(spriteSheets, "player_idle")!))
        this.animations.set(Direction.BOTTOM, new AnimatedSprite(findAnimation(spriteSheets, "player_idle_right")!))
        this.animations.set(Direction.BOTTOM, new AnimatedSprite(findAnimation(spriteSheets, "player_idle_left")!))
        this.animations.set(Direction.BOTTOM, new AnimatedSprite(findAnimation(spriteSheets, "player_idle_back")!))
    }

    public play(player:Player){
        
    }
}