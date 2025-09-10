import * as PIXI from "pixi.js";

export class HpBar {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private bar: PIXI.Graphics;
  private border: PIXI.Graphics;

  private width: number;
  private height: number;

  constructor(
    uiContainer: PIXI.Container,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.width = width;
    this.height = height;

    this.container = new PIXI.Container({ label: "healthbar" });
    this.container.x = x - width / 2;
    this.container.y = y;

    // Fond noir semi-transparent
    this.background = new PIXI.Graphics();
    this.background.rect(0, 0, this.width, this.height);
    this.background.fill({ color: 0x000000, alpha: 0.5 });

    // Barre de vie (vert)
    this.bar = new PIXI.Graphics();
    this.bar.rect(0, 0, this.width, this.height);
    this.bar.fill({ color: 0x00ff00 });

    // Bordure blanche
    this.border = new PIXI.Graphics();
    this.border.rect(0, 0, this.width, this.height);
    this.border.stroke({ width: 2, color: 0xffffff });

    this.container.addChild(this.background);
    this.container.addChild(this.bar);
    this.container.addChild(this.border);

    uiContainer.addChild(this.container);
  }

  update(currentHealth: number, maxHealth: number = 100) {
    const healthRatio = Math.max(0, Math.min(1, currentHealth / maxHealth));
    const barWidth = this.width * healthRatio;

    // On redessine la barre
    this.bar.clear();
    this.bar.rect(0, 0, barWidth, this.height);
    let color = 0x00ff00; // Vert
    if (healthRatio < 0.5) color = 0xffff00; // Jaune si < 50%
    if (healthRatio < 0.25) color = 0xff0000; // Rouge si < 25%
    this.bar.fill({ color });
  }

  destroy() {
    this.container.destroy({children:true});
  }
}
