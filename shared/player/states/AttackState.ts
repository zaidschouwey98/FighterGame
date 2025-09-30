import { EntityState } from "../../messages/EntityState";
import { BaseState } from "./BaseState";
import { MovementService } from "../../services/MovementService";
import { IStatefulEntity } from "../../entities/IStatefulEntity";
import { AbilityType } from "../../enums/AbilityType";
import Position from "../../Position";
import { IInputHandler } from "../../../client/src/core/IInputHandler";
import { Ability } from "../abilities/Ability";
import { EntityCommand, EntityEvent, EventBus } from "../../services/EventBus";

export class AttackState extends BaseState {
  readonly name = EntityState.ATTACK;

  private attackAbility?: Ability;
  private attackDone: boolean = false
  private timer = 0;

  constructor(entity: IStatefulEntity, private movementService: MovementService, private eventBus: EventBus, private inputHandler: IInputHandler) {
    super(entity);
  }

  canEnter(): boolean {
    const ability = this.entity.getAbility(AbilityType.ATTACK);
    if (!ability) return false;
    return (ability.canUse());
  }

  enter() {
    this.attackAbility = this.entity.getAbility(AbilityType.ATTACK);
    if (!this.attackAbility) throw new Error("Player tried to enter AttackState without having an attack ability.");
    this.entity.attackIndex = this.entity.weapon.attackCurrentCombo;
    this.entity.aimVector = this.getAttackDir(this.entity.position);
    this.timer = this.entity.weapon.getAttackDuration(this.entity.attackSpeed);
    this.eventBus.emit(EntityCommand.UPDATED, this.entity.toInfo());
  }

  update(delta: number) {
    let v = this.movementService.getMovementDelta();
    this.entity.movingVector = v;

    MovementService.moveEntity(this.entity, delta, this.entity.speed / 3);
    // this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED, this.entity.toInfo());
    this.eventBus.emit(EntityCommand.POSITION_UPDATED, {
      entityId: this.entity.id,
      position: this.entity.position
    });
    this.timer -= delta;
    if (this.timer <= this.entity.weapon.getAttackDuration(this.entity.attackSpeed) / 3 && !this.attackDone) {

      this.attackAbility!.use(this.entity, this.entity.aimVector);

      this.attackDone = true;
    }
    if (this.timer <= 0) {
      this.entity.changeState(EntityState.IDLE);
    }
  }

  exit() {
    this.attackDone = false;
  }

  private getAttackDir(playerPos: Position): { x: number, y: number } {
    const world = this.inputHandler.getMousePosition();
    const dx = world.x - playerPos.x;
    const dy = world.y - playerPos.y;
    return { x: dx, y: dy }
  }
}
