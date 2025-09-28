import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EntityState } from "../../messages/EntityState";

export abstract class BaseState {
  constructor(protected entity: IStatefulEntity) {}

  abstract readonly name: EntityState;

  canEnter(): boolean {return true}; 
  enter(_params?: unknown): void {}    // appelé quand on entre dans l'état
  exit(): void {}     // appelé quand on sort de l'état
  update(_delta: number): void {} // logique de mise à jour
}
