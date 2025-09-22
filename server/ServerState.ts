import PlayerInfo from "../shared/PlayerInfo";
import { MovementService } from "../shared/services/MovementService";

export class ServerState {
    private players: Map<string, PlayerInfo> = new Map;
    private bots: Set<string> = new Set();

    addPlayer(player: PlayerInfo) {
        this.players.set(player.id, player);
    }

    addBot(bot:PlayerInfo){
        this.bots.add(bot.id);
        this.players.set(bot.id,bot)
    }

    removeBot(botId:string){
        this.bots.delete(botId);
    }

    playerExists(id: string): boolean {
        return this.players.has(id);
    }

    updatePlayer(playerInfo:PlayerInfo){
        if(!this.players.has(playerInfo.id)) throw new Error("Trying to update player not in map");
        this.players.set(playerInfo.id,playerInfo);
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }

    getPlayers(): PlayerInfo[] {
        return Array.from(this.players.values());
    }

    getPlayer(id: string): PlayerInfo {
        if (!this.players.has(id)) throw new Error("Trying to get unset player.");
        return this.players.get(id)!;
    }

    updatePlayers(delta:number){
        for(const p of this.players.values()){
            if(this.bots.has(p.id))
                continue;
            MovementService.movePlayer(p,p.movingVector.dx, p.movingVector.dy, delta);
        }
    }
}
