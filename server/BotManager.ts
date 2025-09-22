import { Server } from "socket.io";
import { Player } from "../shared/player/Player";
import { EventBus } from "../shared/services/EventBus";
import { BotInputHandler } from "./bots/BotInputHandler";
import { BotEventListener } from "./listeners/BotEventListener";
import { ServerState } from "./ServerState";
import { AttackSystem } from "./systems/AttackSystem";
import { DirectionSystem } from "./systems/DirectionSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { UpdateSystem } from "./systems/UpdateSystem";

export class BotManager {
    static botCounter:number = 0;
    private bots:Map<string,Player> = new Map();
    private botInputHandler: Map<string,BotInputHandler> = new Map();

    constructor(
        private io:Server, 
        private serverState: ServerState, 
        private botEventBus:EventBus, 
        private attackSystem:AttackSystem, 
        private directionSystem:DirectionSystem, 
        private movementSystem:MovementSystem,
        private updateSystem:UpdateSystem
    ) { }

    spawnBot(name: string | undefined, position = { x: 0, y: 0 }) {
        const id = "bot-"+BotManager.botCounter++;

        this.botInputHandler.set(id, new BotInputHandler());
        const bot = new Player(
            id,
            position,
            100,
            10,
            id,
            this.botEventBus,
            this.botInputHandler.get(id)!
        );
        this.serverState.addBot(bot.toInfo());
        this.bots.set(bot.id,bot);
        new BotEventListener(this.io,this.botEventBus,bot,this.serverState,this.attackSystem,this.movementSystem,this.directionSystem, this.updateSystem);
        return bot;
    }

    updateBots(delta:number){
        for(const bot of Array.from(this.bots.values())){
            this.botInputHandler.get(bot.id)!.think(bot.toInfo(),this.serverState.getPlayers(),70);
            bot.update(delta);
        }
    }
}
