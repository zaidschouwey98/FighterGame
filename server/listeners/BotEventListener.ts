import { Server } from "socket.io";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackSystem } from "../systems/AttackSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { AttackData } from "../../shared/AttackData";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { UpdateSystem } from "../systems/UpdateSystem";

export class BotEventListener {
  constructor(
    private io: Server,
    eventBus: EventBus,
    private attackSystem: AttackSystem,
    private movementSystem: MovementSystem,
    private directionSystem: DirectionSystem,
    private updateSystem: UpdateSystem
  ) {
    eventBus.on(EventBusMessage.LOCAL_ATTACK_PERFORMED, (attack: AttackData) =>
      this.attackSystem.handleAttack(attack)
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED,
      (player: PlayerInfo) => {
        this.movementSystem.handlePosUpdated(undefined, player);

      }
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED,
      (player: PlayerInfo) => {
        this.directionSystem.handleDirectionUpdate(undefined,player);
      }
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_UPDATED,
      (player: PlayerInfo) => {
        this.updateSystem.handlePlayerUpdated(undefined,player);
      }
    );
  }
}
