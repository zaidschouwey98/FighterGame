import { Socket } from "socket.io";
import { EntityInfo } from "../shared/EntityInfo";
import { EntityType } from "../shared/EntityType";
import { Entity } from "../shared/player/Entity";
import { Player } from "../shared/player/Player";
import PlayerInfo from "../shared/PlayerInfo";
import { CollisionService } from "../shared/services/CollisionService";
import { EventBus, EventBusMessage } from "../shared/services/EventBus";
import { MovementService } from "../shared/services/MovementService";
import { EntityState } from "../shared/PlayerState";

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
        this.eventBus.emit(EventBusMessage.ENTITY_ADDED, { entityInfo: player.toInfo()});
    }

    /**
     * 
     * @param entity 
     * @param socket clientsocket creating the entity so it can create client side without having to wait for response.
     */
    addEntity(entity: Entity, socket?:Socket) {
        this.entities.set(entity.id, entity);
        this.eventBus.emit(EventBusMessage.ENTITY_ADDED, { entityInfo: entity.toInfo(), socket:socket});
    }

    addBot(bot: Player) {
        this.bots.add(bot.id);
        this.entities.set(bot.id, bot)
    }

    getPlayerSocket(id:string):Socket{
        if(!this.playerSockets.has(id))
            throw new Error("Unable to get player socket.");
        return this.playerSockets.get(id)!;
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

    getPlayer(id: string): Player {
        if (!this.entities.has(id)) throw new Error("Trying to get unset player.");
        return this.entities.get(id) as Player;
    }

    updatePlayers(delta: number) {
        for (const p of this.entities.values()) {
            if(p.hp <= 0 || p.isDead){
                p.isDead = true;
                p.state = EntityState.DEAD;
                this.eventBus.emit(EventBusMessage.ENTITY_DIED, { entityInfo: p.toInfo()});
                this.entities.delete(p.id);
            }

            if (this.bots.has(p.id))
                continue;
            let ovEnts = CollisionService.overlappedEntities(p, Array.from(this.entities.values()));
            for(const ovEnt of ovEnts)
                p.onCollideWith(ovEnt);
            p.update(delta);
            
        }
    }

}
