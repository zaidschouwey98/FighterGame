import { Socket } from "socket.io";
import { EntityType } from "../shared/enums/EntityType";
import { Entity } from "../shared/entities/Entity";
import { Player } from "../shared/entities/Player";
import PlayerInfo from "../shared/messages/PlayerInfo";
import { CollisionService } from "../shared/services/CollisionService";
import { EntityEvent, EventBus } from "../shared/services/EventBus";
import { EntityInfo } from "../shared/messages/EntityInfo";

export class ServerState {
    private entities: Map<string, Entity> = new Map();
    private playerSockets: Map<string, Socket> = new Map();
    private bots: Set<string> = new Set();

    constructor(
        private eventBus: EventBus
    ){}
    addPlayer(player: Player, socket: Socket){
        this.entities.set(player.id, player);
        this.playerSockets.set(player.id, socket);
        this.eventBus.emit(EntityEvent.ADDED, player.toInfo());
    }

    /**
     * 
     * @param entity 
     * @param socket clientsocket creating the entity so it can create client side without having to wait for response.
     */
    addEntity(entity: Entity, socket?:Socket) {
        this.entities.set(entity.id, entity);
        // this.eventBus.emit(EntityEvent.ADDED, { entityInfo: entity.toInfo(), socket:socket});
    }

    addBot(bot: Player) {
        this.bots.add(bot.id);
        this.entities.set(bot.id, bot)
    }

    getPlayerSocket(id:string):Socket{
        return this.playerSockets.get(id)!;
    }

    removeBot(botId: string) {
        this.entities.delete(botId);
        this.bots.delete(botId);
    }

    playerExists(id: string): boolean {
        return this.entities.has(id);
    }

    updateEntity(entityInfo: EntityInfo) {
        if (!this.entities.has(entityInfo.id)) throw new Error("Trying to update entity not in map");
        this.entities.get(entityInfo.id)?.updateFromInfo(entityInfo);
    }

    removeEntity(id: string) {
        this.entities.delete(id);
        this.playerSockets.delete(id);
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

    getEntity(id: string): Entity {
        if (!this.entities.has(id)) 
            console.debug("trying to get unknown entity");
        return this.entities.get(id) as Entity;
    }

    updatePlayers(delta: number) {
        for (const p of this.entities.values()) {
            if (this.bots.has(p.id))
                continue;
            let ovEnts = CollisionService.overlappedEntities(p, Array.from(this.entities.values()));
            for(const ovEnt of ovEnts)
                p.onCollideWith(ovEnt);
            p.update(delta);
            
        }
    }

}
