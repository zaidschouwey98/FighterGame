import type { EntityInfo } from "../../../shared/messages/EntityInfo";

export interface EntitySprite {
    syncPlayer(entity: EntityInfo, onDeath?: () => void):void;
    update(delta: number):void;
}