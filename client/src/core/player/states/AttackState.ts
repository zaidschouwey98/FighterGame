import { PlayerState } from "../../../../../shared/PlayerState";
import { BaseState } from "./BaseState";
import type Player from "../Player";
import type { AttackService } from "../../AttackService";
import { EventBusMessage, type EventBus } from "../../EventBus";

export class AttackState extends BaseState {
  readonly name = PlayerState.ATTACK;

  private timer = 10; // Frames avant retour idle (ajuste si besoin)

  constructor(player: Player, private attackService: AttackService, private eventBus:EventBus) {
    super(player);
  }

  enter() {
    // Déclenchement attaque (hitbox envoyée)
    let attackData = this.attackService.performAttack(this.player);
    if(!attackData) throw new Error("AttackData shouldn't be unset.");
    console.log(this.player.toInfo())
    this.eventBus.emit(EventBusMessage.LOCAL_ATTACK_PERFORMED, attackData);
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED,this.player.toInfo());
    this.timer = 10; // court délai pour animer
  }

  update(delta: number) {
    this.timer -= delta;
    if (this.timer <= 0) {
      this.player.changeState(this.player.idleState);
    }
  }

  exit() {}
}
