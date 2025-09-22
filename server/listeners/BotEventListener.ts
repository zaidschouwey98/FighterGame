import { Server } from "socket.io";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackSystem } from "../systems/AttackSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { AttackData } from "../../shared/AttackData";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerToSocketMsg } from "../../shared/ServerToSocketMsg";
import { UpdateSystem } from "../systems/UpdateSystem";
import { AttackResult } from "../../shared/AttackResult";
import { Player } from "../../shared/player/Player";
import { ServerState } from "../ServerState";

export class BotEventListener {
  constructor(
    private io: Server,
    eventBus: EventBus,
    private bot:Player,
    private serverState: ServerState,
    private attackSystem: AttackSystem,
    private movementSystem: MovementSystem,
    private directionSystem: DirectionSystem,
    private updateSystem: UpdateSystem
  ) {
    eventBus.on(EventBusMessage.LOCAL_ATTACK_PERFORMED, (attack: AttackData) =>
      // this.attackSystem.handleAttack(attack, this.io)
    console.log("")
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED,
      (player: PlayerInfo) => {
        // this.movementSystem.handlePosUpdated(undefined, player);

      }
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED,
      (player: PlayerInfo) => {
        // this.directionSystem.handleDirectionUpdate(undefined,player);
      }
    );

    eventBus.on(
      EventBusMessage.LOCAL_PLAYER_UPDATED,
      (player: PlayerInfo) => {
        // this.updateSystem.handlePlayerUpdated(undefined,player);
      }
    );

    eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult:AttackResult)=>{
      bot.handleAttackReceived(attackResult, (id)=>this.serverState.getPlayer(id).position);
    })
  }
}
