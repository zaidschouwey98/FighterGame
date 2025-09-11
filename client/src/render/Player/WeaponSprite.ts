// WeaponSprite.ts
import { Container, Sprite, Spritesheet, Texture } from "pixi.js";
import { Direction } from "../../../../shared/Direction";
import { findTexture } from "../../AssetLoader";
import type PlayerInfo from "../../../../shared/PlayerInfo";

export class WeaponSprite {

  private sprite: Sprite;

  constructor(spriteSheets: Spritesheet[], playerContainer: Container) {
    this.sprite = new Sprite(new Texture(findTexture(spriteSheets, "sword")));
    this.sprite.anchor.set(0.92, 0.5);
    this.sprite.y += 3;
    this.sprite.zIndex = 1;
    this.sprite.rotation = 0.3;
    playerContainer.addChild(this.sprite);
  }

  private setRotationByDirection(direction: Direction) {
    switch (direction) {
      case Direction.BOTTOM:
        this.sprite.scale.x = 1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = 0.3;
        break;
      case Direction.TOP:
        this.sprite.zIndex = -1;
        this.sprite.scale.x = 1;
        this.sprite.rotation = Math.PI + 0.3;
        break;
      case Direction.RIGHT:
        this.sprite.scale.x = 1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = -0.3;
        break;
      case Direction.LEFT:
        this.sprite.scale.x = -1;
        this.sprite.zIndex = 1;
        this.sprite.rotation = 0.3;
        break;
    }
  }

  public update(player: PlayerInfo) {
    const dir = player.movingDirection ?? Direction.BOTTOM;
    this.setRotationByDirection(dir);
  }

  public setVisible(visible: boolean) {
    this.sprite.visible = visible;
  }

  public destroy() {
    this.sprite.destroy();
  }
}
