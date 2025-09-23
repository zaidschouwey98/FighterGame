import { PlayerState } from "../../PlayerState";
import { BaseState } from "./BaseState";
import type { Player } from "../Player";
import type { AttackService } from "../../services/AttackService";
import { EventBusMessage, type EventBus } from "../../services/EventBus";
import { MovementService } from "../../services/MovementService";

export class AttackState extends BaseState {
  readonly name = PlayerState.ATTACK;

  private attackDashDone: boolean = false;
  private attackDone: boolean = false
  private timer = 40;

  constructor(player: Player, private attackService: AttackService, private movementService: MovementService, private eventBus: EventBus) {
    super(player);
  }

  canEnter(): boolean {
    if (this.player.weapon.isDashAttack() && !this.attackDashDone) {
      this.attackDashDone = true;
      this.player.changeState(this.player.attackDashState);
      return false;
    } else {
      this.attackDashDone = false;
      return true;
    }
  }

  enter() {
    this.player.attackIndex = this.player.weapon.attackCurrentCombo;
    this.player.mouseDirection = this.attackService.getAttackDir(this.player.position);
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, this.player.toInfo());
    this.timer = this.player.weapon.getAttackDuration(this.player.attackSpeed);
  }

  update(delta: number) {
    let v = this.movementService.getMovementDelta();
    v.dx = v.dx / 2;
    v.dy = v.dy / 2;
    MovementService.movePlayer(this.player, v.dx, v.dy, delta, this.player.speed / 3)
    this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED, this.player.toInfo());

    this.timer -= delta;
    if(this.timer <= this.player.weapon.getAttackDuration(this.player.attackSpeed) / 3 && !this.attackDone){
      let attackData = this.attackService.performAttack(this.player,this.player.mouseDirection);
      if (!attackData) throw new Error("AttackData shouldn't be unset.");
      this.eventBus.emit(EventBusMessage.LOCAL_ATTACK_PERFORMED, attackData);
      this.attackDone = true;
    }
    if (this.timer <= 0) {
      this.player.changeState(this.player.idleState);
    }
  }

  exit() { 
    this.attackDone = false;
  }
}
