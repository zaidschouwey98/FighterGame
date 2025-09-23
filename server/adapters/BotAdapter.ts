import { AttackData } from "../../shared/AttackData";
import { AttackResult } from "../../shared/AttackResult";
import { Player } from "../../shared/player/Player";
import PlayerInfo from "../../shared/PlayerInfo";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { BotManager } from "../BotManager";
import { ServerState } from "../ServerState";
import { AttackSystem } from "../systems/AttackSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { UpdateSystem } from "../systems/UpdateSystem";


export class BotAdapter {
    constructor(
        private botManager: BotManager,
        private serverState: ServerState,
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
                this.movementSystem.handlePosUpdated(player);

            }
        );

        eventBus.on(
            EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED,
            (player: PlayerInfo) => {
                this.directionSystem.handleDirectionUpdate(player);
            }
        );

        eventBus.on(
            EventBusMessage.LOCAL_PLAYER_UPDATED,
            (player: PlayerInfo) => {
                this.updateSystem.handlePlayerUpdated(player);
            }
        );

        eventBus.on(
            EventBusMessage.PLAYER_PROGRESSED,
            (player: PlayerInfo) => {
                for (const bot of this.botManager.getBots()) {
                    if(player.id == bot.id){
                        bot.updateFromInfo(player)
                    }
                        
                }
            }
        );

        eventBus.on(EventBusMessage.PLAYER_DIED, (res:{playerInfo:PlayerInfo, socket:any, killerId:any}) => {
            for (const bot of this.botManager.getBots()) {
                if(res.playerInfo.id == bot.id){
                    bot.die();
                    this.botManager.deleteBot(bot.id);
                }
                    
            }
        });

        eventBus.on(EventBusMessage.ATTACK_RESULT, (res:{attackResult: AttackResult, socket:any}) => {
            for (const bot of this.botManager.getBots()) {
                bot.handleAttackReceived(res.attackResult, (id)=>this.serverState.getPlayer(id).position);
            }
            
        })
    }
}
