import { Application, Assets, Container, Sprite } from 'pixi.js';
import { GameController } from './GameController';


(async () => {
  const app = new Application();
  await app.init({ background: '#1099bb', resizeTo: window });
  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);
  const gameController = new GameController(app.stage, "http://localhost:3000");
  window.addEventListener("keydown", (e) => {
    const myId = "monId"; // récupérer via socket.id
    const player = gameController.getPlayerState(myId);
    if (!player) return;

    if (e.key === "ArrowUp") gameController.movePlayer(myId, player.position.x, player.position.y - 10);
    if (e.key === "ArrowDown") gameController.movePlayer(myId, player.position.x, player.position.y + 10);
    if (e.key === "ArrowLeft") gameController.movePlayer(myId, player.position.x - 10, player.position.y);
    if (e.key === "ArrowRight") gameController.movePlayer(myId, player.position.x + 10, player.position.y);
  });
  app.ticker.add((delta) => {

  })

})();