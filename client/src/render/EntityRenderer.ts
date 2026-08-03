import { Container, Spritesheet } from "pixi.js";

import type { EntitySprite } from "./EntitySprite";
import PlayerSprite from "./Player/PlayerSprite";
import { EntityType } from "../../../shared/enums/EntityType";
import type PlayerInfo from "../../../shared/messages/PlayerInfo";
import type { ProjectileInfo } from "../../../shared/messages/ProjectileInfo";
import { ProjectileSprite } from "./ProjectileSprite";
import type { AttackResult } from "../../../shared/types/AttackResult";
import { DamagePopup } from "./DamagePopup";
import { GameState } from "../core/GameState";
import type Position from "../../../shared/Position";
import type { EntityInfo } from "../../../shared/messages/EntityInfo";
import { ENTITY_DEPTH_FOOT_OFFSET } from "../../../shared/constantes";

export default class EntityRenderer {
    private entityContainers: Map<string, Container>;
    private spriteSheets: Spritesheet[];
    private entitySprites: Map<string, EntitySprite>;
    private entities: Map<string, EntityInfo>;
    /** Conteneur partagé avec props (arbres / herbe) pour Y-sort */
    private entityContainer: Container;
    private staticEffectContainer: Container;

    constructor(
        /** Doit être le même conteneur que les props sol (terrain) */
        depthContainer: Container,
        spriteSheets: Spritesheet[],
        private _tileContainer: Container,
        private _terrainContainer: Container,
        staticEffectContainer: Container,
        /** Au-dessus des corps (overlay) pour les barres HP */
        private platesLayer: Container,
    ) {
        this.spriteSheets = spriteSheets;
        this.staticEffectContainer = staticEffectContainer
        this.entityContainers = new Map();
        this.entitySprites = new Map();
        this.entities = new Map();
        this.entityContainer = depthContainer;
        this.entityContainer.sortableChildren = true;
        this.platesLayer.sortableChildren = true;
    }

    public addEntity(entityInfo: EntityInfo) {
        const container = new Container();
        container.label = entityInfo.id;

        let sprite: EntitySprite;
        switch (entityInfo.entityType) {
            case EntityType.PLAYER:
                const player = entityInfo as PlayerInfo;
                container.label = "PlayerContainer"
                sprite = new PlayerSprite(
                    player.id,
                    container,
                    this.spriteSheets,
                    this._terrainContainer,
                    this._tileContainer,
                    this.staticEffectContainer,
                    this.platesLayer,
                    player.name || "unknown-client-side",
                    player.weaponType,
                );
                break;
            case EntityType.PROJECTILE:
                const projectile = entityInfo as ProjectileInfo;
                container.label = "ProjectileContainer"
                sprite = new ProjectileSprite(Math.atan2(projectile.movingVector.dy, projectile.movingVector.dx),container,this.spriteSheets);

                break;
            default:
                throw new Error("Unknown entity type : " + entityInfo.entityType);
        }

        this.entityContainers.set(entityInfo.id, container);
        this.entitySprites.set(entityInfo.id, sprite!);
        this.entities.set(entityInfo.id, entityInfo);

        this.entityContainer.addChild(container);
        this.applyWorldPosition(entityInfo.id, entityInfo.position.x, entityInfo.position.y, entityInfo.entityType);
    }

    public removeEntity(entityId: string) {
        const container = this.entityContainers.get(entityId);
        const sprite = this.entitySprites.get(entityId);

        if (container) {
            this.entityContainer.removeChild(container);
            container.destroy({ children: true,texture:true });
        }
        sprite?.destroy();

        this.entityContainers.delete(entityId);
        this.entitySprites.delete(entityId);
        this.entities.delete(entityId);
    }

    public syncPosition(res: { entityId: string; position: Position; }[]){
        for (const entity of res) {
            const info = this.entities.get(entity.entityId);
            this.applyWorldPosition(
                entity.entityId,
                entity.position.x,
                entity.position.y,
                info?.entityType,
            );
        }
    }

    private depthFor(y: number, entityType?: EntityType): number {
        // Joueur/projectiles : ancre centre → comparer aux pieds. Props : bas déjà en y.
        if (entityType === EntityType.PLAYER || entityType === EntityType.PROJECTILE) {
            return Math.round(y + ENTITY_DEPTH_FOOT_OFFSET);
        }
        return Math.round(y);
    }

    private applyWorldPosition(entityId: string, x: number, y: number, entityType?: EntityType) {
        const playerContainer = this.entityContainers.get(entityId);
        if (!playerContainer) return;
        playerContainer.x = x;
        playerContainer.y = y;
        playerContainer.zIndex = this.depthFor(y, entityType ?? this.entities.get(entityId)?.entityType);
        this.entitySprites.get(entityId)?.setWorldPosition(x, y);
    }

    public entityDied(entity:EntityInfo, onLocalPlayerDeath: (entityId:string)=>void){
        let entitySprite = this.entitySprites.get(entity.id);
        if (!entitySprite) throw new Error("Dead player shouldn't be already deleted.");
        entitySprite.syncPlayer(entity, ()=>{
                this.removeEntity(entity.id);
                onLocalPlayerDeath(entity.id);
            });
    }

    public syncEntities(entities: EntityInfo[]) {
        for (const entity of entities) {
            let playerSprite = this.entitySprites.get(entity.id);
            if (!playerSprite) throw new Error("Entity should be added before sync.");
            this.entities.set(entity.id, entity);
            this.syncPosition([{ entityId: entity.id, position: entity.position }]);
            playerSprite.syncPlayer(entity);
        }
    }

    public showDmgPopup(attackResult: AttackResult){
        const entity = GameState.instance.getEntity(attackResult.targetId);
        if (!entity) return;

        const popup = new DamagePopup(attackResult.dmg, attackResult.isCrit);
        popup.showAt(entity.position.x, entity.position.y - 40, this.staticEffectContainer);
    }

    public update(delta: number) {
        for (const sprite of this.entitySprites.values()) {
            sprite.update(delta);
        }
    }
}
