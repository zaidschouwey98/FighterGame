import type PlayerInfo from "../../../shared/PlayerInfo";
import Player from "./player/Player";

export class GameState {
    private static _instance: GameState;
    public players: Map<string, Player> = new Map();

    private constructor() { }

    public static get instance(): GameState {
        if (!GameState._instance) GameState._instance = new GameState();
        return GameState._instance;
    }

    addPlayer(info: PlayerInfo) {
        this.players.set(info.id, Player.fromInfo(info));
    }

    updatePlayer(info: PlayerInfo) {
        const player = this.players.get(info.id);
        if (!player) {
            console.warn(`Player ${info.id} not found, creating it.`);
            this.addPlayer(info);
            return;
        }
        player.updateFromInfo(info);
    }

    restorePlayers(infos: PlayerInfo[]) {
        this.players.clear();
        for (const info of infos) {
            this.addPlayer(info);
        }
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }

    getPlayer(id: string): Player | undefined {
        return this.players.get(id);
    }
}
