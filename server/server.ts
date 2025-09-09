import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PlayerState } from "../shared/PlayerState";
import { AttackData } from "../shared/AttackData";
import { HitboxValidationService } from "./HitboxValidationService";
import { AttackResult } from "../shared/AttackResult";
import PlayerInfo from "../shared/PlayerInfo"
import path from "path";
import { Direction } from "../shared/Direction";
import { ClientToSocketMsg } from "../shared/ClientToSocketMsg";
import { ServerToSocketMsg } from "../shared/ServerToSocketMsg";


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
var counter = 1;
const PORT = process.env.PORT || 3000;


const players: Record<string, PlayerInfo> = {};

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Ajouter le joueur avec une position aléatoire
  const startX = 0;
  const startY = 0;
  const newPlayer: PlayerInfo = {
    position: { x: startX, y: startY },
    hp: 100,
    speed: 10,
    mouseDirection:{x:0,y:0},
    id: socket.id,
    state: PlayerState.IDLE,
    movingDirection: Direction.BOTTOM,
    attackIndex: 0,
    attackDashMaxSpeed: 3,
    isDead: false
  }
  players[socket.id] = newPlayer;
  players[socket.id].name = "player_" + counter++;
  // Envoyer l'état initial au nouveau joueur
  socket.emit(ServerToSocketMsg.CONNECTED, socket.id);
  socket.emit(ServerToSocketMsg.CURRENT_PLAYERS, players);


  // Notifier tous les autres joueurs
  socket.broadcast.emit(ServerToSocketMsg.NEW_PLAYER, players[socket.id]);

  // Gestion mouvement


  socket.on(ClientToSocketMsg.PLAYER_UPDATE, (playerInfo:PlayerInfo) => {
    if (players[socket.id]) {
      players[socket.id] = playerInfo;
      socket.broadcast.emit(ServerToSocketMsg.PLAYER_UPDATE, players[socket.id]);
    }
  })

  socket.on(ClientToSocketMsg.START_ATTACK, (playerInfo:PlayerInfo)=>{
    if (players[socket.id]) {
      players[socket.id] = playerInfo;
      socket.broadcast.emit(ServerToSocketMsg.START_ATTACK, players[socket.id]);
    }
  })


  socket.on(ClientToSocketMsg.ATTACK, (data: AttackData) => {
    const attacker = players[data.playerId];
    if (!attacker) return;
    // Mettre à jour l'état du joueur
    attacker.position = data.position;
    attacker.state = data.playerAction;

    // Trouver les joueurs touchés
    const hitPlayerIds = HitboxValidationService.getTargetsInHitbox(
      data.hitbox,
      players,
      data.playerId
    );

    const attackResults = [];
    let blockedBy: PlayerInfo | undefined;
    let killNumber: number = 0;
    // Appliquer les dégâts
    for (const targetId of hitPlayerIds) {
      const target = players[targetId];
      if (!target) continue;

      const damage = 20; // todo CHANGE THIS
      if (target.state != PlayerState.BLOCKING
      ) {
        target.hp -= damage;
      } else {
        blockedBy = target;
      }


      attackResults.push(target);

      // Vérifier la mort
      if (target.hp <= 0 && !target.isDead) {
        attacker.hp += 20
        killNumber++;
        handlePlayerDeath(target.id);
      }
    }
    // Envoyer les résultats à tous les clients
    io.emit(ServerToSocketMsg.ATTACK_RESULT, {
      attackerId: data.playerId,
      hitPlayers: attackResults,
      knockbackStrength: data.knockbackStrength,
      blockedBy: blockedBy,
      killNumber: killNumber
    } as AttackResult);
  });

  // Déconnexion
  socket.on(ClientToSocketMsg.DISCONNECT, () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit(ServerToSocketMsg.DISCONNECT, socket.id);
  });

  function handlePlayerDeath(playerId: string) {
    const player = players[playerId];
    if (!player) return;

    console.log(`Player ${playerId} is dead`);

    player.isDead = true;
    player.state = PlayerState.DEAD;

    // Notifier tous les clients
    io.emit(ServerToSocketMsg.PLAYER_DIED, player);

    // Optionnel : Respawn après 3s
    setTimeout(() => {
      respawnPlayer(playerId);
    }, 4000);
  }

  function respawnPlayer(playerId: string) {
    const player = players[playerId];
    if (!player) return;
    player.hp = 100;
    player.isDead = false;
    player.position = { x: 0, y: 0 }; // Spawn point
    player.state = PlayerState.IDLE;
    io.emit(ServerToSocketMsg.PLAYER_RESPAWNED, player);
  }
});



server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
