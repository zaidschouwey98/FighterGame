import type PlayerInfo from "../../../shared/PlayerInfo";

export class GameState {
    private static _instance: GameState;
    public players: Map<string, PlayerInfo> = new Map();

    private constructor() { }

    public static get instance(): GameState {
        if (!GameState._instance) GameState._instance = new GameState();
        return GameState._instance;
    }

    addPlayer(info: PlayerInfo) {
        this.players.set(info.id, info);
    }

    updatePlayer(info: PlayerInfo) {
        let player = this.players.get(info.id);
        if (!player) {
            console.warn(`Player ${info.id} not found, creating it.`);
            // this.addPlayer(info);
            return;
        }
        player = info;
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

    getPlayer(id: string): PlayerInfo | undefined {
        return this.players.get(id);
    }
}
