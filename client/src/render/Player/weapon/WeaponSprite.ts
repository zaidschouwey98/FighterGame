import { Container, Spritesheet, Sprite } from "pixi.js";
import { WeaponAnimController } from "./weapon_anim/WeaponAnimController";
import { PlayerState } from "../../../../../shared/PlayerState";
import { findTexture } from "../../../AssetLoader";
import { Direction } from "../../../../../shared/Direction";
import type { WeaponType } from "../../../../../shared/WeaponType";
import { createWeaponAnimations } from "./CreateWeaponAnimation";



export class WeaponSprite {
  private sprite: Sprite;
  private controller: WeaponAnimController;
  private currentDirection: Direction = Direction.BOTTOM;

  constructor(spriteSheets: Spritesheet[],_staticEffectContainer:Container, playerContainer: Container, type: WeaponType, skin = "default", anchor: {x:number,y:number}, posX:number, posY:number) {
    console.log(skin)
    this.sprite = new Sprite(findTexture(spriteSheets, type as any));
    this.sprite.anchor = anchor;
    this.sprite.x = posX;
    this.sprite.y = posY;
    this.sprite.label = "weapon";
    playerContainer.addChild(this.sprite);

    this.controller = new WeaponAnimController(createWeaponAnimations(this.sprite, type,playerContainer,spriteSheets));
  }

  setState(state: PlayerState, comboIndex = 0, mouseDirection:{x:number,y:number}) {
    this.controller.setState(state, comboIndex,mouseDirection);
  }

  setDirection(direction: Direction) {
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;
      this.controller.setDirection(direction);
    }
  }

  update(delta: number) {
    this.controller.update(delta);
  }
}
