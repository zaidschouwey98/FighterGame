import express from "express";
import http from "http";
import { Server } from "socket.io";
import Player from "../shared/Player";
import Position from "../shared/Position";
import { Action } from "../shared/Action";
import { AttackData } from "../shared/AttackData";
import { HitboxValidationService } from "./HitboxValidationService";
import { AttackResult } from "../shared/AttackResult";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" } // Pour le dev avec Vite
});

const PORT = 3000;


const players: Record<string, Player> = {};

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Ajouter le joueur avec une position aléatoire
  const startX = 0;
  const startY = 0
  players[socket.id] = new Player(new Position(startX, startY), 100, 10, socket.id);

  // Envoyer l'état initial au nouveau joueur
  socket.emit("currentPlayers", players);

  // Notifier tous les autres joueurs
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Gestion mouvement
  socket.on("move", (data: { x: number; y: number; action: Action }) => {
    if (players[socket.id]) {
      players[socket.id].position.x = data.x;
      players[socket.id].position.y = data.y;
      players[socket.id].currentAction = data.action;
      // Différenciez l'action selon le mouvement
      // (Vous devrez implémenter cette logique)
      // Notifier tous les autres joueurs 
      socket.broadcast.emit("playerMoved", players[socket.id]);

      // Renvoyer aussi au joueur qui bouge pour synchronisation
      socket.emit("playerMoved", players[socket.id]);
    }
  });

  socket.on("attack", (data: AttackData) => {
    const attacker = players[data.playerId];
    if (!attacker) return;
    socket.broadcast.emit("playerAttacks", data)
    socket.emit("playerAttacks", data);
    // Mettre à jour l'état du joueur
    attacker.position = data.position;
    attacker.currentAction = data.playerAction;

    // Trouver les joueurs touchés
    const hitPlayerIds = HitboxValidationService.getTargetsInHitbox(
      data.hitbox,
      players,
      data.playerId
    );

    const attackResults = [];

    // Appliquer les dégâts
    for (const targetId of hitPlayerIds) {
      const target = players[targetId];
      if (!target) continue;

      const damage = 20;
      target.hp -= damage;

      attackResults.push(target);

      // Vérifier la mort
      if (target.hp <= 0) {
        console.log("player's dead")
        // this.handlePlayerDeath(targetId);
      }
    }
    // Envoyer les résultats à tous les clients
    io.emit("attackResult", {
      attackerId: data.playerId,
      hitPlayers: attackResults
    }  as AttackResult);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
