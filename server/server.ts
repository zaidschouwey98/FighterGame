import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {

});

const PORT = 3000;


// const players: Record<string, Player> = {};

// io.on("connection", (socket) => {
//   console.log(`Player connected: ${socket.id}`);

//   // Ajouter le joueur
//   players[socket.id] = new Player(new Position(0,0),100,10,socket.id);

//   // Envoyer état initial
//   socket.emit("currentPlayers", players);

//   // Notifier les autres
//   socket.broadcast.emit("newPlayer", players[socket.id]);

//   // Gestion mouvement
//   socket.on("move", (data: { x: number; y: number }) => {
//     if (players[socket.id]) {
//       players[socket.id].position.x = data.x;
//       players[socket.id].position.y = data.y;
//       socket.broadcast.emit("playerMoved", players[socket.id]);
//     }
//   });

//   // Déconnexion
//   socket.on("disconnect", () => {
//     delete players[socket.id];
//     io.emit("playerDisconnected", socket.id);
//   });
// });

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
