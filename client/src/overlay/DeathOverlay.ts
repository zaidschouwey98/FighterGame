import type { IOverlay } from "./IOverlay";
import * as PIXI from "pixi.js";

export class DeathOverlay implements IOverlay {
  container = new PIXI.Container();
  private div: HTMLDivElement | null = null;
  private onRespawn: () => void;

  constructor(onRespawn: () => void) {
    this.onRespawn = onRespawn;
  }

  init(): void {
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.top = "0";
    this.div.style.left = "0";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.background = "rgba(0,0,0,0.7)";
    this.div.style.display = "flex";
    this.div.style.flexDirection = "column";
    this.div.style.justifyContent = "center";
    this.div.style.alignItems = "center";
    this.div.style.zIndex = "10";
    this.div.style.fontFamily = "sans-serif";

    const title = document.createElement("h1");
    title.innerText = "Vous êtes une merde";
    title.style.color = "white";
    title.style.marginBottom = "20px";

    const button = document.createElement("button");
    button.innerText = "Respawn";
    button.style.padding = "10px 20px";
    button.style.fontSize = "18px";
    button.onclick = () => {
      this.onRespawn();
    };

    this.div.appendChild(title);
    this.div.appendChild(button);
    document.body.appendChild(this.div);
  }

  destroy(): void {
    if (this.div) {
      document.body.removeChild(this.div);
      this.div = null;
    }
    this.container.removeChildren();
  }
}
