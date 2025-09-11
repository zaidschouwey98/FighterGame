// WeaponSprite.ts
import { AnimatedSprite, Container, Sprite, Spritesheet, Texture } from "pixi.js";
import { Direction } from "../../../../shared/Direction";
import { findAnimation, findTexture } from "../../AssetLoader";
import type PlayerInfo from "../../../../shared/PlayerInfo";

export class WeaponSprite {

  private sprite: Sprite;
  private swordSpawning: AnimatedSprite;
  private currentlyVisible:boolean = true;

  constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
    this.sprite = new Sprite(new Texture(findTexture(spriteSheets, "sword")));
    this.sprite.anchor.set(0.92, 0.5);
    this.sprite.y += 3;
    this.sprite.zIndex = 1;
    this.sprite.rotation = 0.3;
    playerContainer.addChild(this.sprite);

    this.swordSpawning = new AnimatedSprite(findAnimation(spriteSheets, "sword_spawning")!);
    this.swordSpawning.animationSpeed = 0.2;
    this.swordSpawning.loop = false;
    this.swordSpawning.anchor.set(0.92, 0.5);
    this.swordSpawning.y += 3;
    this.swordSpawning.zIndex = 1;
    this.swordSpawning.rotation = 0.3;
    this.swordSpawning.visible = false;
    playerContainer.addChild(this.swordSpawning);
  }

  private setRotationByDirection(direction: Direction) {
    switch (direction) {
      case Direction.BOTTOM:
        this.sprite.scale.x = 1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = 0.3;
        this.swordSpawning.scale.x = 1;
        this.swordSpawning.zIndex = 1;
        this.swordSpawning.rotation = 0.3;
        break;
      case Direction.TOP:
        this.sprite.zIndex = -1;
        this.sprite.scale.x = 1;
        this.sprite.rotation = Math.PI + 0.3;
        this.swordSpawning.zIndex = -1;
        this.swordSpawning.scale.x = 1;
        this.swordSpawning.rotation = Math.PI + 0.3;
        break;
      case Direction.RIGHT:
        this.sprite.scale.x = 1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = -0.3;
        this.swordSpawning.scale.x = 1;
        this.swordSpawning.zIndex = 1;
        this.swordSpawning.rotation = -0.3;
        break;
      case Direction.LEFT:
        this.sprite.scale.x = -1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = 0.3;
        this.swordSpawning.scale.x = -1;
        this.swordSpawning.zIndex = 1;
        this.swordSpawning.rotation = 0.3;
        break;
    }
  }

  public update(player: PlayerInfo) {
    const dir = player.movingDirection ?? Direction.BOTTOM;
    this.setRotationByDirection(dir);
  }

  public setVisible(visible: boolean) {
  if (visible && !this.currentlyVisible) {
    this.currentlyVisible = true;

    // Cacher le sprite d'arme pendant l'animation
    this.sprite.visible = false;

    // Préparer l'animation
    this.swordSpawning.visible = true;
    this.swordSpawning.gotoAndStop(0); // reset au frame 0
    this.swordSpawning.onComplete = () => {
      this.swordSpawning.visible = false;
      this.sprite.visible = true;
    };

    // Jouer l'animation
    this.swordSpawning.play();
  } 
  else if (!visible) {
    this.currentlyVisible = false;
    this.sprite.visible = false;
    this.swordSpawning.visible = false;
  }
}


  public destroy() {
    this.sprite.destroy();
  }
}
