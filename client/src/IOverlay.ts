import { Container } from "pixi.js";

export interface IOverlay {
  container: Container;
  init(): void;
  destroy(): void;
}