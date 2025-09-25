import { Container, Spritesheet } from "pixi.js";
import { AnimController } from "./AnimController";
import { IdleAnim } from "./anim/IdleAnim";
import { MovingAnim } from "./anim/MovingAnim";
import { AttackDashAnim } from "./anim/AttackDashAnim";
import { PlayerState } from "../../../../shared/PlayerState";
import { EffectRenderer } from "../EffectRenderer";
import type PlayerInfo from "../../../../shared/PlayerInfo";
import { HitAnim } from "./anim/HitAnim";
import { DieAnim } from "./anim/DieAnim";
import { TeleportingAnim } from "./anim/TeleportAnim";
import { KnockBackAnim } from "./anim/KnockBackAnim";
import { WeaponSprite } from "./weapon/WeaponSprite";
import { BlockAnim } from "./anim/BlockAnim";
import type { WeaponFactory } from "./weapon/WeaponFactory";
import { PlayerPlate } from "../UI/PlayerPlate";
import type { EntitySprite } from "../EntitySprite";

export default class PlayerSprite implements EntitySprite{
    private controller: AnimController;
    private playerPlate: PlayerPlate;
    private weapon: WeaponSprite;
    constructor(
        public id: string,
        private playerContainer: Container,
        spriteSheets: Spritesheet[],
        _terrainContainer: Container,
        staticEffectsContainer: Container,
        playerName: string,
        weaponFactory: WeaponFactory
    ) {
        const effectRenderer = new EffectRenderer(spriteSheets, playerContainer, staticEffectsContainer);

        // Label au-dessus du joueur

        this.playerPlate = new PlayerPlate(this.playerContainer, playerName);


        this.controller = new AnimController({
            [PlayerState.IDLE]: new IdleAnim(spriteSheets, this.playerContainer),
            [PlayerState.MOVING]: new MovingAnim(spriteSheets, this.playerContainer),
            [PlayerState.ATTACK_DASH]: new AttackDashAnim(spriteSheets, this.playerContainer, effectRenderer),
            [PlayerState.BLOCKING]: new BlockAnim(spriteSheets, playerContainer),
            [PlayerState.KNOCKBACK]: new KnockBackAnim(spriteSheets, playerContainer),
            [PlayerState.HIT]: new HitAnim(spriteSheets, playerContainer),
            [PlayerState.TELEPORTING]: new TeleportingAnim(spriteSheets, playerContainer, staticEffectsContainer),
            [PlayerState.DEAD]: new DieAnim(spriteSheets, _terrainContainer),
        }, PlayerState.IDLE);

        this.weapon = weaponFactory.createWeaponSprite(spriteSheets, this.playerContainer, this.controller, staticEffectsContainer);
    }

    public syncPlayer(entity: PlayerInfo, onDeath?: () => void) {
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