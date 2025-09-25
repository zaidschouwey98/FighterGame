import { Container, Spritesheet } from "pixi.js";

import type { EntityInfo } from "../../../shared/EntityInfo";
import type { EntitySprite } from "./EntitySprite";
import PlayerSprite from "./Player/PlayerSprite";
import { EntityType } from "../../../shared/EntityType";
import { WeaponFactory } from "./Player/weapon/WeaponFactory";
import type PlayerInfo from "../../../shared/PlayerInfo";
import type { ProjectileInfo } from "../../../shared/player/weapons/projectiles/ProjectileInfo";
import { ProjectileSprite } from "./ProjectileSprite";

export default class EntityRenderer {
    private entityContainers: Map<string, Container>;
    private spriteSheets: Spritesheet[];
    private entitySprites: Map<string, EntitySprite>;
    private entities: Map<string, EntityInfo>;
    private entityContainer: Container;
    private staticEffectContainer: Container;

    constructor(playerContainer: Container, spriteSheets: Spritesheet[], private _terrainContainer: Container, staticEffectContainer: Container) {
        this.spriteSheets = spriteSheets;
        this.staticEffectContainer = staticEffectContainer
        this.entityContainers = new Map();
        this.entitySprites = new Map();
        this.entities = new Map();
        this.entityContainer = playerContainer;
    }

    public addEntity(entityInfo: EntityInfo) {
        const container = new Container();
        container.label = entityInfo.id;

        let sprite: EntitySprite;
        switch (entityInfo.entityType) {
            case EntityType.PLAYER:
                const player = entityInfo as PlayerInfo;
                container.label = "PlayerContainer"
                sprite = new PlayerSprite(player.id, container, this.spriteSheets, this._terrainContainer, this.staticEffectContainer, player.name || "unknown-client-side", new WeaponFactory(player.weapon!));
                break;
            // case EntityType.MOB:
            //     sprite = new MobSprite(entityInfo.id, container, this.spriteSheets);
            //     break;
            case EntityType.PROJECTILE:
                const projectile = entityInfo as ProjectileInfo;
                container.label = "ProjectileContainer"
                sprite = new ProjectileSprite(Math.atan2(projectile.movingVector.dy, projectile.movingVector.dx),container,this.spriteSheets);

                break;
            // case EntityType.OBJECT:
            //     // par  décor statique
            //     // sprite = new ObjectSprite(...)
            //     break;
            default:
                throw new Error("Unknown entity type : " + entityInfo.entityType);
        }

        this.entityContainers.set(entityInfo.id, container);
        this.entitySprites.set(entityInfo.id, sprite!);
        this.entities.set(entityInfo.id, entityInfo);

        this.entityContainer.addChild(container);
    }

    public removeEntity(entityId: string) {
        const container = this.entityContainers.get(entityId);

        if (container) {
            this.entityContainer.removeChild(container);
            container.destroy({ children: true,texture:true });
        }

        this.entityContainers.delete(entityId);
        this.entitySprites.delete(entityId);
        this.entities.delete(entityId);
    }

    public syncPosition(entities: EntityInfo[]){
        for (const entity of entities) {
            let playerContainer = this.entityContainers.get(entity.id);
            if (!playerContainer) continue;
            playerContainer.x = entity.position.x;
            playerContainer.y = entity.position.y;
        }
    }

    public entityDied(entity:EntityInfo){
        let entitySprite = this.entitySprites.get(entity.id);
        if (!entitySprite) throw new Error("Dead player shouldn't be already deleted.");
        entitySprite.syncPlayer(entity, ()=>this.removeEntity(entity.id));
    }

    public syncEntities(entities: EntityInfo[]) {
        for (const entity of entities) {
            let playerSprite = this.entitySprites.get(entity.id);
            if (!playerSprite) continue;
            // Mise à jour de la position
            this.syncPosition([entity]);
            playerSprite.syncPlayer(entity);
        }
    }

    public update(delta: number) {
        for (const sprite of this.entitySprites.values()) {
            sprite.update(delta);
        }
    }
}
