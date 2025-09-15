import type PlayerInfo from "../../../shared/PlayerInfo";
import { Subject } from "./observer/Subject";

export class GameState extends Subject{
    private static _instance: GameState;
    public players: Map<string, PlayerInfo> = new Map();

    private constructor() { 
        super();
    }

    public static get instance(): GameState {
        if (!GameState._instance) GameState._instance = new GameState();
        return GameState._instance;
    }

    addPlayer(info: PlayerInfo) {
        this.players.set(info.id, info);
        this.notify(Array.from(this.players.values()));
    }

    updatePlayer(info: PlayerInfo) {
        let player = this.players.get(info.id);
        if (!player) {
            console.warn(`Player ${info.id} not found, creating it.`);
            this.addPlayer(info);
            return;
        }
        
        this.players.set(info.id,info);
        this.notify(Array.from(this.players.values()));
    }

    restorePlayers(infos: PlayerInfo[]) {
        this.players.clear();
        for (const info of infos) {
            this.addPlayer(info);
        }
    }

    removePlayer(id: string) {
        this.players.delete(id);
        this.notify(Array.from(this.players.values()));
    }

    getPlayer(id: string): PlayerInfo | undefined {
        return this.players.get(id);
    }
}
