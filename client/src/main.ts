import { Application } from 'pixi.js';
import { getSpritesheets } from './AssetLoader';
import { initDevtools } from '@pixi/devtools';
import { SceneManager } from './scene/SceneManager';
import { GameScene } from './scene/GameScene';
// https://youtu.be/Uy-dey7tUT0?t=19 ANIM ATTACK
// TOdo add credits song for my death, but I refused
(async () => {
  const app = new Application();
  await app.init({
    background: '#1099bb',
    resizeTo: window,
    // textureGCActive: true, // Enable texture garbage collection
    // textureGCMaxIdle: 7200, // 2 hours idle time
    // textureGCCheckCountMax: 1200,
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

  app.ticker.add((delta) => {
    sceneManager.update(delta.deltaTime);

  });
})();