import { Container, Spritesheet, Ticker } from "pixi.js";
import { AnimController } from "./AnimController";
import { IdleAnim } from "./anim/IdleAnim";
import { MovingAnim } from "./anim/MovingAnim";
import { AttackDashAnim } from "./anim/AttackDashAnim";
import { EntityState } from "../../../../shared/messages/EntityState";
import { EffectRenderer } from "../EffectRenderer";
import type PlayerInfo from "../../../../shared/messages/PlayerInfo";
import { HitAnim } from "./anim/HitAnim";
import { DieAnim } from "./anim/DieAnim";
import { TeleportingAnim } from "./anim/TeleportAnim";
import { KnockBackAnim } from "./anim/KnockBackAnim";
import { WeaponSprite } from "./weapon/WeaponSprite";
import { BlockAnim } from "./anim/BlockAnim";
import { WeaponFactory } from "./weapon/WeaponFactory";
import { PlayerPlate } from "../UI/PlayerPlate";
import type { EntitySprite } from "../EntitySprite";
import { WeaponType } from "../../../../shared/enums/WeaponType";
import { TeleportedAnim } from "./anim/TeleportedAnim";

export default class PlayerSprite implements EntitySprite {
    private controller: AnimController;
    private playerPlate: PlayerPlate;
    private weapon: WeaponSprite;
    private currentWeaponType: WeaponType;
    private weaponFactory: WeaponFactory;
    constructor(
        public id: string,
        private playerContainer: Container,
        private spriteSheets: Spritesheet[],
        _terrainContainer: Container,
        tileContainer: Container,
        private staticEffectsContainer: Container,
        playerName: string,
        weaponType: WeaponType,
    ) {
        const effectRenderer = new EffectRenderer(spriteSheets, playerContainer, staticEffectsContainer);

        this.weaponFactory = new WeaponFactory();
        // Label au-dessus du joueur

        this.playerPlate = new PlayerPlate(this.playerContainer, playerName);

        this.controller = new AnimController({
            [EntityState.IDLE]: new IdleAnim(spriteSheets, this.playerContainer),
            [EntityState.MOVING]: new MovingAnim(spriteSheets, this.playerContainer),
            [EntityState.ATTACK_DASH]: new AttackDashAnim(spriteSheets, this.playerContainer, effectRenderer),
            [EntityState.BLOCKING]: new BlockAnim(spriteSheets, playerContainer),
            [EntityState.KNOCKBACK]: new KnockBackAnim(spriteSheets, playerContainer),
            [EntityState.HIT]: new HitAnim(spriteSheets, playerContainer),
            [EntityState.TELEPORTING]: new TeleportingAnim(spriteSheets, playerContainer, staticEffectsContainer),
            [EntityState.TELEPORTED]: new TeleportedAnim(spriteSheets, playerContainer, tileContainer),
            [EntityState.DEAD]: new DieAnim(spriteSheets, _terrainContainer),
        }, EntityState.IDLE);

        this.weapon = this.weaponFactory.createWeaponSprite(weaponType, spriteSheets, this.playerContainer, this.controller, staticEffectsContainer);
        this.currentWeaponType = weaponType;
    }

    public setWeapon(weaponType: WeaponType) {
        this.currentWeaponType = weaponType;
        this.weapon.destroy();
        this.weapon = this.weaponFactory.createWeaponSprite(weaponType, this.spriteSheets, this.playerContainer, this.controller, this.staticEffectsContainer)
    }

    public syncPlayer(entity: PlayerInfo, onDeath?: () => void) {
        if (entity.weapon != this.currentWeaponType) {
            this.setWeapon(entity.weapon);
        }

        this.playerPlate.update(entity.hp, entity.maxHp, entity.currentXp, entity.lvlXp, entity.currentLvl);
        this.controller.update(entity, onDeath);
        this.weapon.setState(entity);
        this.weapon.setDirection(entity.movingDirection);
    }

    public update(delta: number) {
        this.weapon.update(delta);
    }

    public destroy() {
        this.controller.stop();
        this.weapon.destroy();
        this.playerPlate.destroy();
    }
}