import { Server } from "socket.io";
import { ServerState } from "./ServerState";
import { ServerToSocketMsg } from "../shared/ServerToSocketMsg";
import { BotManager } from "./BotManager";

export class GameLoop {
  constructor(
    private serverState: ServerState,
    private botManager: BotManager,
    private io: Server
  ) { }

  start() {
    const tickRate = 60;
    const tickInterval = 1000 / tickRate; // en ms
    let last = performance.now();

    setInterval(() => {
      const now = performance.now();
      const elapsed = (now - last) / 1000;  // secondes réelles écoulées
      last = now;

      // Normalisation : à 60 FPS → delta = 1
      const deltaTime = elapsed / (1 / tickRate);

      this.botManager.updateBots(deltaTime);
      this.serverState.updatePlayers(deltaTime);
    }, tickInterval);
  }
}
