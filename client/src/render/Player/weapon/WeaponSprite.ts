import { Container, Spritesheet, Sprite } from "pixi.js";
import { WeaponAnimController } from "./weapon_anim/WeaponAnimController";
import { findTexture } from "../../../AssetLoader";
import { Direction } from "../../../../../shared/enums/Direction";
import type { WeaponType } from "../../../../../shared/enums/WeaponType";
import { createWeaponAnimations } from "./CreateWeaponAnimation";
import type PlayerInfo from "../../../../../shared/messages/PlayerInfo";



export class WeaponSprite {
  private sprite: Sprite;
  private shadowSprite: Sprite;
  private controller: WeaponAnimController;
  private currentDirection: Direction = Direction.BOTTOM;

  constructor(spriteSheets: Spritesheet[], _staticEffectContainer: Container, playerContainer: Container, type: WeaponType, skin = "default", anchor: { x: number, y: number }, posX: number, posY: number) {
    console.log(skin)
    this.sprite = new Sprite(findTexture(spriteSheets, type as any));
    this.sprite.anchor = anchor;
    this.sprite.x = posX;
    this.sprite.y = posY;
    this.sprite.label = "weapon";

    const groundShadow = new Sprite(findTexture(spriteSheets, type as any));
    groundShadow.label = "weaponShadow";
    groundShadow.anchor = anchor;
    groundShadow.x = this.sprite.x;
    groundShadow.y = this.sprite.y;
    groundShadow.tint = 0x000000;
    groundShadow.alpha = 0.3;
    groundShadow.scale.y = 1; // aplatie
    groundShadow.zIndex = -2;
    this.shadowSprite = groundShadow;
 
    playerContainer.addChild(this.shadowSprite);
    playerContainer.addChild(this.sprite);


    this.controller = new WeaponAnimController(createWeaponAnimations(this.sprite, type, playerContainer, spriteSheets));
  }

  setState(playerInfo:PlayerInfo) {
    this.controller.setState(playerInfo);
  }

  setDirection(direction: Direction) {
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;
      this.controller.setDirection(direction);
    }
  }

  update(delta: number) {
    
    //if scale.x > 0 && scale.y
    this.shadowSprite.scale = this.sprite.scale;
    this.shadowSprite.rotation = this.sprite.rotation;
    this.shadowSprite.x = this.sprite.x;
    this.shadowSprite.y = this.sprite.y + 4;
    this.shadowSprite.visible = this.sprite.visible;
    this.controller.update(delta);
  }

  destroy(){
    this.sprite.destroy({children:true});
    this.shadowSprite.destroy({children:true});
  }
}
