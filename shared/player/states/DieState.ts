import { PlayerState } from "../../PlayerState";
import { BaseState } from "./BaseState";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import { ClientPlayer } from "../ClientPlayer";

export class DieState extends BaseState {
  readonly name = PlayerState.DEAD;

  constructor(player: ClientPlayer, private eventBus: EventBus) {
    super(player);
  }

  enter() {
    this.player.isDead = true;

    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    console.log(`${this.player.id} is DEAD`);
  }

  update(_delta: number) {
  }

  exit() {
    // Nettoyage au respawn
    this.player.isDead = false;
    console.log(`${this.player.id} respawn`);
  }
}
