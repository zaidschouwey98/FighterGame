import { Server } from "socket.io";
import { ServerState } from "./ServerState";
import { ServerToSocketMsg } from "../shared/ServerToSocketMsg";
import { BotManager } from "./BotManager";

export class GameLoop {
  private interval?: NodeJS.Timeout;
  private running:boolean = false;
  constructor(
    private serverState: ServerState,
    private botManager: BotManager,
    private io: Server
  ) { }

  start() {
    if(this.running)
      return;
    console.log("Gameloop running...");
    this.running = true;
    const tickRate = 60;
    const tickInterval = 1000 / tickRate; // en ms
    let last = performance.now();

    this.interval = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - last) / 1000;  // secondes réelles écoulées
      last = now;

      // Normalisation : à 60 FPS → delta = 1
      const deltaTime = elapsed / (1 / tickRate);

      this.botManager.updateBots(deltaTime);
      this.serverState.updatePlayers(deltaTime);
    }, tickInterval);
  }

  stop(){
    this.running = false;
    console.log("Gameloop stoping...");

    clearInterval(this.interval);
  }
}
