import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { ClientPlayer } from "../../entities/ClientPlayer";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { EventBus, EventBusMessage } from "../../services/EventBus";

export class DieState extends BaseState {
  readonly name = EntityState.DEAD;

  constructor(entity: IStatefulEntity, private eventBus: EventBus) {
    super(entity);
  }

  enter() {
    this.entity.isDead = true;

    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.entity.toInfo());
    console.log(`${this.entity.id} is DEAD`);
  }

  update(_delta: number) {
  }

  exit() {
    // Nettoyage au respawn
    this.entity.isDead = false;
    console.log(`${this.entity.id} respawn`);
  }
}
