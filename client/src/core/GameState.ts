import type Player from "../../../shared/Player";

export class GameState {
    players: Map<string, Player> = new Map();

    updatePlayers(players: Player[]) {
        this.players.clear();
        players.forEach(p => this.players.set(p.id, p));
    }

    updatePlayer(player: Player) {
        this.players.set(player.id, player);
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }
}
