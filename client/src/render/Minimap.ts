import * as PIXI from "pixi.js";


export class Minimap {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private playerDot: PIXI.Graphics;
  private playerDots: PIXI.Graphics[] = [];

  constructor(private app: PIXI.Application, uiContainer:PIXI.Container, private mapSize = 200) {
    this.container = new PIXI.Container({label:"minimap"});
    this.container.x = this.app.canvas.width - this.mapSize - 100; // Haut droite
    this.container.y = 20;

    this.background = new PIXI.Graphics();

    this.background.rect(0, 0, this.mapSize, this.mapSize);
    this.background.fill({color:0x000000, alpha:0.5});
    this.container.addChild(this.background);

    this.playerDot = new PIXI.Graphics();
    
    this.playerDot.circle(0, 0, 4);
    
    this.playerDot.fill(0x0000ff);
    this.container.addChild(this.playerDot);

    uiContainer.addChild(this.container);
  }

  update(playerX: number, playerY: number, players: any[]) { // TODO CHANGE ANY
    const scale = 0.1;

    const centerX = this.mapSize / 2;
    const centerY = this.mapSize / 2;

    // Position du joueur local (toujours centré)
    this.playerDot.x = centerX;
    this.playerDot.y = centerY;

    // Nettoyer anciens points
    this.playerDots.forEach(dot => this.container.removeChild(dot));
    this.playerDots = [];

    // Dessiner les autres joueurs
    players.forEach(p => {
      if (p.isLocal) return; // Ne pas redessiner le joueur local

      const dot = new PIXI.Graphics();
      
      dot.circle(0, 0, 3);
      dot.fill(0xff0000); 
      dot.x = centerX + (p.x - playerX) * scale;
      dot.y = centerY + (p.y - playerY) * scale;

      this.container.addChild(dot);
      this.playerDots.push(dot);
    });
  }
}
