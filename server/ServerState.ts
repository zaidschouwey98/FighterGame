import { EntityInfo } from "../shared/EntityInfo";
import { EntityType } from "../shared/EntityType";
import PlayerInfo from "../shared/PlayerInfo";
import { Projectile } from "../shared/Projectile";
import { CollisionService } from "../shared/services/CollisionService";
import { MovementService } from "../shared/services/MovementService";

export class ServerState {
    private entities: Map<string, EntityInfo> = new Map;
    private bots: Set<string> = new Set();

    addPlayer(player: EntityInfo) {
        this.entities.set(player.id, player);
    }

    addBot(bot: EntityInfo) {
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
        this.entities.set(playerInfo.id, playerInfo);
    }

    removePlayer(id: string) {
        this.entities.delete(id);
    }

    getPlayers(): EntityInfo[] {
        return Array.from(this.entities.values())
            .filter((e): e is PlayerInfo => e.entityType === EntityType.PLAYER);
    }

    getProjectiles(): Projectile[] {
        return Array.from(this.entities.values())
            .filter((e): e is Projectile => e.entityType === EntityType.PROJECTILE);
    }

    getPlayer(id: string): PlayerInfo {
        if (!this.entities.has(id)) throw new Error("Trying to get unset player.");
        return this.entities.get(id) as PlayerInfo;
    }

    updatePlayers(delta: number) {
        for (const p of this.entities.values()) {
            if (this.bots.has(p.id))
                continue;
            let t = CollisionService.overlappedEntities(p, Array.from(this.entities.values()));
            console.log(t);
            MovementService.moveEntity(p, p.movingVector.dx, p.movingVector.dy, delta);
        }
    }
}
