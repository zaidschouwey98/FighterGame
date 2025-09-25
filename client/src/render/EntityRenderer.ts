import { Container, Spritesheet } from "pixi.js";

import type { EntityInfo } from "../../../shared/EntityInfo";
import type { EntitySprite } from "./EntitySprite";
import PlayerSprite from "./Player/PlayerSprite";
import { EntityType } from "../../../shared/EntityType";

export default class EntityRenderer {
    private playerContainers: Map<string, Container>;
    private spriteSheets: Spritesheet[];
    private entitySprites: Map<string, EntitySprite>;
    private entities: Map<string, EntityInfo>;
    private playerContainer: Container;
    private staticEffectContainer: Container;

    constructor(playerContainer: Container, spriteSheets: Spritesheet[], private _terrainContainer: Container, staticEffectContainer: Container) {
        this.spriteSheets = spriteSheets;
        this.staticEffectContainer = staticEffectContainer
        this.playerContainers = new Map();
        this.entitySprites = new Map();
        this.entities = new Map();
        this.playerContainer = playerContainer;
    }

    public addEntity(entityInfo: EntityInfo) {
        const container = new Container();
        container.label = entityInfo.id;

        let sprite: any;
        switch (entityInfo.entityType) {
            case EntityType.PLAYER:
                sprite = new PlayerSprite(entityInfo.id, container, this.spriteSheets, this._terrainContainer, this.staticEffectContainer, player.name || "unknown-client-side", new WeaponFactory(player.weapon!));
                break;
            // case EntityType.MOB:
            //     sprite = new MobSprite(entityInfo.id, container, this.spriteSheets);
            //     break;
            // case EntityType.PROJECTILE:
            //     sprite = new ArrowSprite(entityInfo.id, container, this.spriteSheets);
            //     break;
            // case EntityType.OBJECT:
            //     // par  décor statique
            //     // sprite = new ObjectSprite(...)
            //     break;
        }

        if (sprite) {
            this.entities.set(entityInfo.id, { container, sprite });
            this.rootContainer.addChild(container);
        }
    }

    public removePlayer(playerId: string) {
        const container = this.playerContainers.get(playerId);
        const sprite = this.playerSprites.get(playerId);

        if (sprite) {
            sprite.destroy();
        }

        if (container) {
            this.playerContainer.removeChild(container);
            container.destroy({ children: true,texture:true });
        }

        this.playerContainers.delete(playerId);
        this.playerSprites.delete(playerId);
        this.players.delete(playerId);
    }

    public syncPosition(players: PlayerInfo[]){
        for (const player of players) {
            let playerContainer = this.playerContainers.get(player.id);
            if (!playerContainer) continue;
            playerContainer.x = player.position.x;
            playerContainer.y = player.position.y;
        }
    }

    public playerDied(player:PlayerInfo){
        let playerSprite = this.playerSprites.get(player.id);
        if (!playerSprite) throw new Error("Dead player shouldn't be already deleted.");
        playerSprite.syncPlayer(player, ()=>this.removePlayer(player.id));
    }

    public syncPlayers(players: PlayerInfo[]) {
        for (const player of players) {
            let playerSprite = this.playerSprites.get(player.id);
            if (!playerSprite) continue;
            // Mise à jour de la position
            this.syncPosition([player]);
            playerSprite.syncPlayer(player);
        }
    }

    public update(delta: number) {
        for (const sprite of this.playerSprites.values()) {
            sprite.update(delta);
        }
    }
}
