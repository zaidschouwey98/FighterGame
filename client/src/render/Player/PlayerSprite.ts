import { Container, Spritesheet, TextStyle, Text } from "pixi.js";
import { AnimController } from "./AnimController";
import { IdleAnim } from "./anim/IdleAnim";
import { MovingAnim } from "./anim/MovingAnim";
import { AttackDashAnim } from "./anim/AttackDashAnim";
import { PlayerState } from "../../../../shared/PlayerState";
import { EffectRenderer } from "../EffectRenderer";
import type PlayerInfo from "../../../../shared/PlayerInfo";
import { HitAnim } from "./anim/HitAnim";
import { DieAnim } from "./anim/DieAnim";
import { HpBar } from "../UI/HpBar";
import { TeleportingAnim } from "./anim/TeleportAnim";
import { KnockBackAnim } from "./anim/KnockBackAnim";
import { WeaponSprite } from "./weapon/WeaponSprite";
import { BlockAnim } from "./anim/BlockAnim";
import type { WeaponFactory } from "./weapon/WeaponFactory";

export default class PlayerSprite {
    private controller: AnimController;
    private hpBar: HpBar;
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
        this.hpBar = new HpBar(this.playerContainer, 0, -24, 40, 10);
        // Label au-dessus du joueur
        const style = new TextStyle({ fontFamily: "Arial", fontSize: 8, fill: "#ffffff", stroke: "#000000" });
        const name = new Text(playerName, style);
        name.anchor.set(0.5);
        name.resolution = 2;
        name.y = -20;
        this.playerContainer.addChild(name);

        

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

        this.weapon = weaponFactory.createWeaponSprite(spriteSheets, this.playerContainer, this.controller);
    }

    public syncPlayer(player: PlayerInfo) {
        this.hpBar.update(player.hp, 100);
        this.controller.update(player);
        this.weapon.setState(player.state);
        this.weapon.setDirection(player.movingDirection);
    }

    public update(delta: number) {
        this.weapon.update(delta);
    }

    public destroy() {
        this.controller.stop();
        this.playerContainer.destroy({ children: true });
    }
}