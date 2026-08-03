import type { EntityInfo } from "../../../shared/messages/EntityInfo";

export interface EntitySprite {
    syncPlayer(entity: EntityInfo, onDeath?: () => void):void;
    update(delta: number):void;
    setWorldPosition(x: number, y: number): void;
    destroy(): void;
}