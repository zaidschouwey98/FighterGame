import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import { ServerToSocketMsg } from "../shared/enums/ServerToSocketMsg";
import { EventBus } from "../shared/services/EventBus";
import { ServerState } from "./ServerState";
import { GameLoop } from "./GameLoop";
import { AttackSystem } from "./systems/AttackSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { DirectionSystem } from "./systems/DirectionSystem";
import { HumanEventListener } from "./listeners/PlayerEventListener";
import { BotManager } from "./BotManager";
import { UpdateSystem } from "./systems/UpdateSystem";
import { SocketIoAdapter } from "./adapters/SocketIoAdapter";
import { ProgressionSystem } from "./systems/ProgressionSystem";


const app = express();
const server = http.createServer(app);
// Servir le build du client
app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get(/.*/, (_, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

const io = new Server(server, {
  cors: { origin: "*" } // Pour le dev avec Vite
});
const PORT = process.env.PORT || 3000;



const eventBus = new EventBus();

const serverState = new ServerState(eventBus);
// systèmes
const socketIoAdapter = new SocketIoAdapter(eventBus, io, serverState);

let playerNb = 0;

const attackSystem = new AttackSystem(serverState,eventBus);
const movementSystem = new MovementSystem(eventBus, serverState);
const directionSystem = new DirectionSystem(eventBus, serverState);
const updateSystem = new UpdateSystem(eventBus,serverState);
const progressSystem = new ProgressionSystem(serverState,eventBus);



const botManager = new BotManager(io,serverState,eventBus,attackSystem,directionSystem,movementSystem, updateSystem, progressSystem);
// botManager.spawnBot("bibitee");
// botManager.spawnBot("bibitee");

const gameLoop = new GameLoop(serverState,botManager,io);
io.on("connection", (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);
  if(++playerNb > 0){
    gameLoop.start();
  };
  const listener = new HumanEventListener(socket, attackSystem, movementSystem, directionSystem, updateSystem, serverState);
  listener.register();

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    if(--playerNb <= 0){
      gameLoop.stop();
    }
    serverState.removeEntity(socket.id);
    io.emit(ServerToSocketMsg.DISCONNECT, socket.id);
  });
});


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
