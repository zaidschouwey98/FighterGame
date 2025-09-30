import { ATTACK_COOLDOWN, BLOCK_COOLDOWN, BLOCK_DURATION, TP_COOLDOWN, TP_DISTANCE } from "../../constantes";
import { LivingEntity } from "../../entities/LivingEntity";
import { EntityState } from "../../messages/EntityState";
import { EntityCommand, EntityEvent, EventBus } from "../../services/EventBus";
import { Ability } from "./Ability";


export class AttackAbility extends Ability {
  constructor(private eventBus: EventBus) {
    super(0); // No cooldown for basic attack
  }

  use(entity: LivingEntity, aimVector: { x: number; y: number }) {
    if (!this.canUse()) return;

    const rot = Math.atan2(aimVector.y, aimVector.x);
    const attackData = entity.weapon.useWeapon(entity.position, rot);
    attackData.playerId = entity.id;
    this.eventBus.emit(EntityCommand.ATTACK, { entityId: entity.id, attackData: attackData });


    this.triggerCooldown();
  }
}


export class BlockAbility extends Ability {
  constructor(private eventBus: EventBus) {
    super(BLOCK_COOLDOWN);
  }

  use() {
    if (!this.canUse()) return;
    this.triggerCooldown();
  }
}

export class TeleportAbility extends Ability {
  private readonly teleportDistance = TP_DISTANCE;

  constructor(private eventBus: EventBus) {
    super(TP_COOLDOWN);
  }

  use(entity: LivingEntity, dir: { x: number; y: number }, distance: number) {
    if (!this.canUse()) return;

    entity.changeState(EntityState.TELEPORTED);
    const destX = entity.position.x + dir.x * distance;
    const destY = entity.position.y + dir.y * distance;

    entity.position.x = destX;
    entity.position.y = destY;

    this.eventBus.emit(EntityCommand.UPDATED, entity.toInfo());

    // this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, entity.toInfo());

    // this.eventBus.emit(EventBusMessage.TELEPORT_DESTINATION_HELPER); // Clear helper

    this.triggerCooldown();
  }
}
