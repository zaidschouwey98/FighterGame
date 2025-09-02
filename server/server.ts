import express from "express";
import http from "http";
import { Server } from "socket.io";
import Player from "../shared/Player";
import Position from "../shared/Position";
import { Action } from "../shared/Action";
import { AttackData } from "../shared/AttackData";

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

        attacker.currentAction = data.playerAction;
        socket.broadcast.emit("playerAttacks", data)
        socket.emit("playerAttacks", data);
        // attacker.attackCooldown = 25;

        const hitPlayers: string[] = [];
        for (const [id, target] of Object.entries(players)) {
            if (id === data.playerId) continue;

            const dx = target.position.x - data.hitbox.x;
            const dy = target.position.y - data.hitbox.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= data.hitbox.range) {
                // Vérifier si dans l'arc d'attaque
                const targetAngle = Math.atan2(dy, dx);
                const angleDiff = Math.abs(targetAngle - data.rotation);
                const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

                if (Math.abs(normalizedAngleDiff) <= data.hitbox.arcAngle) {
                    target.hp -= 30;
                    hitPlayers.push(id);
                    console.log(`Player ${id} hit! HP: ${target.hp}`);
                }
            }
        }

        io.emit("attackResult", {
            attackerId: data.playerId,
            position: data.position,
            rotation: data.rotation,
            hitPlayers: hitPlayers
        });
    });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
