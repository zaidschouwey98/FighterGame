import * as PIXI from "pixi.js";
import type { IOverlay } from "./IOverlay";


export class MenuOverlay implements IOverlay {
  container = new PIXI.Container();
  private div: HTMLDivElement | null = null;
  private onStart: (pseudo: string) => void;

  constructor(onStart: (pseudo: string) => void) {
    this.onStart = onStart;
  }

  init(): void {
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.top = "0";
    this.div.style.left = "0";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.background = "rgba(0,0,0,0.5)";
    this.div.style.display = "flex";
    this.div.style.flexDirection = "column";
    this.div.style.justifyContent = "center";
    this.div.style.alignItems = "center";
    this.div.style.zIndex = "10";
    this.div.style.fontFamily = "sans-serif";

    const title = document.createElement("h1");
    title.innerText = "Entrez votre pseudo";
    title.style.color = "white";
    title.style.marginBottom = "10px";

    const input = document.createElement("input");
    input.placeholder = "Pseudo...";
    input.style.padding = "10px";
    input.style.fontSize = "18px";
    input.style.marginBottom = "10px";

    const button = document.createElement("button");
    button.innerText = "Jouer";
    button.style.padding = "10px 20px";
    button.style.fontSize = "18px";
    button.onclick = () => {
      const name = input.value.trim() || "Joueur";
      this.onStart(name);
    };

    this.div.appendChild(title);
    this.div.appendChild(input);
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
