import { Application } from 'pixi.js';
import { getSpritesheets } from './AssetLoader';
import { initDevtools } from '@pixi/devtools';
import { SceneManager } from './scene/SceneManager';
import { GameScene } from './scene/GameScene';

// TOdo add credits song for my death, but I refused
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
  const sceneManager = new SceneManager(app);
  const gameScene = new GameScene(window.location.origin, app, spritesheets);

  sceneManager.changeScene(gameScene);

  app.ticker.add((delta) => sceneManager.update(delta.deltaTime));
})();