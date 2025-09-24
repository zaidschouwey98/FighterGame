import { Server } from "socket.io";
import { Player } from "../shared/player/Player";
import { EventBus } from "../shared/services/EventBus";
import { BotInputHandler } from "./bots/BotInputHandler";
import { ServerState } from "./ServerState";
import { AttackSystem } from "./systems/AttackSystem";
import { DirectionSystem } from "./systems/DirectionSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { UpdateSystem } from "./systems/UpdateSystem";
import { BotAdapter } from "./adapters/BotAdapter";
import { ServerToSocketMsg } from "../shared/ServerToSocketMsg";
import { ProgressionSystem } from "./systems/ProgressionSystem";
import { ClientPlayer } from "../shared/player/ClientPlayer";

export class BotManager {
    static botCounter: number = 0;
    private bots: Map<string, ClientPlayer> = new Map();
    private botInputHandler: Map<string, BotInputHandler> = new Map();
    private botAdapter: BotAdapter; // 👈 un seul adapter global

    constructor(
        private io: Server,
        private serverState: ServerState,
        private eventBus: EventBus,
        private attackSystem: AttackSystem,
        private directionSystem: DirectionSystem,
        private movementSystem: MovementSystem,
        private updateSystem: UpdateSystem,
        private progressionSystem: ProgressionSystem
    ) {
        this.botAdapter = new BotAdapter(
            this,
            this.serverState,
            this.eventBus,
            this.attackSystem,
            this.movementSystem,
            this.directionSystem,
            this.updateSystem
        );
    }

    spawnBot(name: string = "", position = { x: Math.random() * 1000, y: Math.random() * 1000 }) {
        const id = "bot-" + BotManager.botCounter++;
        this.botInputHandler.set(id, new BotInputHandler());
        const bot = new ClientPlayer(
            id,
            id,
            position,
            100,
            10,
            this.eventBus,
            this.botInputHandler.get(id)!
        );
        this.serverState.addBot(bot);
        this.bots.set(bot.id, bot);
        return bot;
    }

    updateBots(delta: number) {
        for (const bot of this.bots.values()) {
            this.botInputHandler.get(bot.id)!.think(bot.toInfo(), this.serverState.getPlayers(), 70);
            bot.update(delta);
        }
    }

    deleteBot(botId:string){
        this.bots.delete(botId);
        this.botInputHandler.delete(botId);
        this.serverState.removeBot(botId);
        let bot = this.spawnBot();
        this.io.emit(ServerToSocketMsg.NEW_PLAYER, bot.toInfo());
    }

    getBots(): Player[] {
        return Array.from(this.bots.values());
    }
}
