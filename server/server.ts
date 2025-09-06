import express from "express";
import http from "http";
import { Server } from "socket.io";
import Player from "../shared/Player";
import Position from "../shared/Position";
import { Action } from "../shared/Action";
import { AttackData } from "../shared/AttackData";
import { HitboxValidationService } from "./HitboxValidationService";
import { AttackResult } from "../shared/AttackResult";
import PlayerInfo from "../shared/PlayerInfo"
import path from "path";

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
  const startY = 0
  const newPlayer = new Player(new Position(startX, startY), 100, 10, socket.id);
  players[socket.id] = newPlayer.toInfo();
  players[socket.id].name = "player_" + counter++;
  socket.emit("localPlayer", players[socket.id]);
  // Envoyer l'état initial au nouveau joueur
  socket.emit("currentPlayers", players);


  // Notifier tous les autres joueurs
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Gestion mouvement
  socket.on("move", (data: { x: number; y: number; action: Action }) => {
    if (players[socket.id]) {
      players[socket.id].position.x = data.x;
      players[socket.id].position.y = data.y;
      players[socket.id]._currentAction = data.action;
      // Différenciez l'action selon le mouvement
      // (Vous devrez implémenter cette logique)
      // Notifier tous les autres joueurs 
      socket.broadcast.emit("playerMoved", players[socket.id]);

      // Renvoyer aussi au joueur qui bouge pour synchronisation
      socket.emit("playerMoved", players[socket.id]);
    }
  });

  socket.on("dash", (data: { x: number; y: number; action: Action }) => {
    if (players[socket.id]) {
      players[socket.id].position.x = data.x;
      players[socket.id].position.y = data.y;
      players[socket.id]._currentAction = data.action;
      // Différenciez l'action selon le mouvement
      // (Vous devrez implémenter cette logique)
      // Notifier tous les autres joueurs 
      socket.broadcast.emit("playerDashed", players[socket.id]);

      // Renvoyer aussi au joueur qui bouge pour synchronisation
      socket.emit("playerDashed", players[socket.id]);
    }
  });
  socket.on("block", (action: Action) => {
    if (players[socket.id]) {
      players[socket.id]._currentAction = action;
      socket.broadcast.emit("playerIsBlocking", players[socket.id]);

      // Renvoyer aussi au joueur qui bouge pour synchronisation
      socket.emit("playerIsBlocking", players[socket.id]);
    }
  });

  socket.on("stopMoving", (action: Action) => {
    if (players[socket.id]) {
      players[socket.id]._currentAction = action;
      socket.broadcast.emit("playerStoppedMoving", players[socket.id]);
      socket.emit("playerStoppedMoving", players[socket.id]);
    }
  })

  socket.on("actionUpdated", (action: Action) => {
    if (players[socket.id]) {
      players[socket.id]._currentAction = action;
      socket.broadcast.emit("actionUpdated", players[socket.id]);
      socket.emit("actionUpdated", players[socket.id]);
    }
  })

  socket.on("blockEnd", (player: Player) => {
    if (players[socket.id]) {
      players[socket.id].position.x = player.position.x;
      players[socket.id].position.y = player.position.y;
      players[socket.id]._currentAction = player.currentAction;
      socket.broadcast.emit("playerIsBlocking", players[socket.id]);

      // Renvoyer aussi au joueur qui bouge pour synchronisation
      socket.emit("playerBlockingEnded", players[socket.id] as PlayerInfo);
    }
  });
  socket.on("attack", (data: AttackData) => {
    const attacker = players[data.playerId];
    if (!attacker) return;
    socket.broadcast.emit("playerAttacks", data)
    socket.emit("playerAttacks", data);
    // Mettre à jour l'état du joueur
    attacker.position = data.position;
    attacker._currentAction = data.playerAction;

    // Trouver les joueurs touchés
    const hitPlayerIds = HitboxValidationService.getTargetsInHitbox(
      data.hitbox,
      players,
      data.playerId
    );

    const attackResults = [];
    let blockedBy:PlayerInfo | undefined;
    let killNumber:number = 0;
    // Appliquer les dégâts
    for (const targetId of hitPlayerIds) {
      const target = players[targetId];
      if (!target) continue;
      
      const damage = 20; // todo CHANGE THIS
      if(target._currentAction != Action.BLOCK_BOTTOM
        && target._currentAction != Action.BLOCK_LEFT
        && target._currentAction != Action.BLOCK_RIGHT
        && target._currentAction != Action.BLOCK_TOP
      ){
        target.hp -= damage;
      } else {
        blockedBy = target;
      }
        

      attackResults.push(target);

      // Vérifier la mort
      if (target.hp <= 0 && !target.isDead) {
        attacker.hp +=20
        killNumber ++;
        handlePlayerDeath(target.id);
      }
    }
    // Envoyer les résultats à tous les clients
    io.emit("attackResult", {
      attackerId: data.playerId,
      hitPlayers: attackResults,
      knockbackStrength: data.knockbackStrength,
      blockedBy:blockedBy,
      killNumber: killNumber
    } as AttackResult);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });

  function handlePlayerDeath(playerId: string) {
    const player = players[playerId];
    if (!player) return;

    console.log(`Player ${playerId} is dead`);

    player.isDead = true;
    player._currentAction = Action.DIE; // Assure-toi que "DEAD" est dans ton enum Action

    // Notifier tous les clients
    io.emit("playerDied", player);

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
    player._currentAction = Action.IDLE_DOWN;
    io.emit("playerRespawned", player);
  }
});



server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
