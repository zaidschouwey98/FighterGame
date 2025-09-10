import { Container } from "pixi.js";

export interface IScene {
  container: Container;
  init(): void;
  update(delta: number): void;
  destroy(): void;
}