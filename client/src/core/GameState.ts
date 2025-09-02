import type Player from "../../../shared/Player";

export class GameState {
    players: Map<string, Player> = new Map();

    updatePlayers(players: Player[]) {
        this.players.clear();
        players.forEach(p => this.players.set(p.id, p));
    }

    updatePlayer(newPlayer: Player) {
        const existing = this.players.get(newPlayer.id);
        if (existing) {
            existing.position = newPlayer.position;
            existing.currentAction = newPlayer.currentAction;
            existing.speed = newPlayer.speed;
            existing.hp = newPlayer.hp;
        } else {
            this.players.set(newPlayer.id, newPlayer);
        }
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }
}
