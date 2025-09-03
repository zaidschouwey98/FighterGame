import { Application, Container } from 'pixi.js';
import { GameController } from './GameController';
import { getSpritesheets } from './AssetLoader';
import { initDevtools } from '@pixi/devtools';


(async () => {
  const app = new Application();
  await app.init({ 
    background: '#1099bb', 
    resizeTo: window,
  });
  initDevtools({ app });
  // Chargez d'abord les assets
  console.log("Chargement des assets...");
  const spritesheets = await getSpritesheets();
  console.log("Assets chargés !");
  
  document.body.appendChild(app.canvas);
  const container = new Container();
  app.stage.addChild(container);

  // Créez le contrôleur de jeu
  const gameController = new GameController(container, "http://localhost:3000", app,spritesheets);

  // Animation loop
  app.ticker.add((delta) => {
    gameController.update(delta.deltaTime);
  });
  


})();