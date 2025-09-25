import { Socket } from "socket.io";
import { EntityInfo } from "../shared/EntityInfo";
import { EntityType } from "../shared/EntityType";
import { Entity } from "../shared/player/Entity";
import { Player } from "../shared/player/Player";
import PlayerInfo from "../shared/PlayerInfo";
import { CollisionService } from "../shared/services/CollisionService";
import { EventBus, EventBusMessage } from "../shared/services/EventBus";
import { MovementService } from "../shared/services/MovementService";

export class ServerState {
    private entities: Map<string, Entity> = new Map;
    private bots: Set<string> = new Set();

    constructor(
        private eventBus: EventBus
    ){}

    addEntity(entity: Entity, socket?:Socket) {
        this.entities.set(entity.id, entity);
        this.eventBus.emit(EventBusMessage.ENTITY_ADDED, { entityInfo: entity.toInfo(), socket:socket});
    }

    addBot(bot: Player) {
        this.bots.add(bot.id);
        this.entities.set(bot.id, bot)
    }

    removeBot(botId: string) {
        this.entities.delete(botId);
        this.bots.delete(botId);
    }

    playerExists(id: string): boolean {
        return this.entities.has(id);
    }

    updatePlayer(playerInfo: PlayerInfo) {
        if (!this.entities.has(playerInfo.id)) throw new Error("Trying to update player not in map");
        this.entities.get(playerInfo.id)?.updateFromInfo(playerInfo);
    }

    removePlayer(id: string) {
        this.entities.delete(id);
    }

    getPlayers(): Player[] {
        return Array.from(this.entities.values())
            .filter((e): e is Player => e.entityType === EntityType.PLAYER);
    }

    getPlayersAsInfo(): PlayerInfo[] {
        return Array.from(this.entities.values())
            .filter((e): e is Player => e.entityType === EntityType.PLAYER).map((val)=>val.toInfo());
    }

    // getProjectiles(): Projectile[] {
    //     return Array.from(this.entities.values())
    //         .filter((e): e is Projectile => e.entityType === EntityType.PROJECTILE);
    // }

    getPlayer(id: string): Player {
        if (!this.entities.has(id)) throw new Error("Trying to get unset player.");
        return this.entities.get(id) as Player;
    }

    updatePlayers(delta: number) {
        for (const p of this.entities.values()) {
            if (this.bots.has(p.id))
                continue;
            let ovEnts = CollisionService.overlappedEntities(p, Array.from(this.entities.values()));
            for(const ovEnt of ovEnts)
                p.onCollideWith(ovEnt);
            MovementService.moveEntity(p, p.movingVector.dx, p.movingVector.dy, delta);
        }
    }
}
