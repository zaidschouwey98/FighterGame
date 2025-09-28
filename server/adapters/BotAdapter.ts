import { AttackReceivedData, KnockbackData } from "../../shared/types/AttackResult";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { BotManager } from "../BotManager";
import { ServerState } from "../ServerState";
import { AttackSystem } from "../systems/AttackSystem";
import { DirectionSystem } from "../systems/DirectionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { UpdateSystem } from "../systems/UpdateSystem";
import { AttackDataBase } from "../../shared/types/AttackData";
import { EntityInfo } from "../../shared/messages/EntityInfo";
import { EventBus } from "../../shared/services/EventBus";


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

        // eventBus.on(EventBusMessage.LOCAL_ATTACK_PERFORMED, (attack: AttackDataBase) =>
        //     this.attackSystem.handleAttack(attack)
        // );

        // eventBus.on(
        //     EventBusMessage.LOCAL_PLAYER_POSITION_UPDATED,
        //     (player: PlayerInfo) => {
        //         this.movementSystem.handlePosUpdated(player);

        //     }
        // );

        // eventBus.on(
        //     EventBusMessage.LOCAL_PLAYER_DIRECTION_UPDATED,
        //     (player: PlayerInfo) => {
        //         this.directionSystem.handleDirectionUpdate(player);
        //     }
        // );

        // eventBus.on(
        //     EventBusMessage.LOCAL_PLAYER_UPDATED,
        //     (player: PlayerInfo) => {
        //         this.updateSystem.handlePlayerUpdated(player);
        //     }
        // );

        // eventBus.on(EventBusMessage.ENTITY_SYNC, (entityInfo:EntityInfo)=>{
        //         for (const bot of this.botManager.getBots()) {
        //             if(entityInfo.id == bot.id){
        //                 bot.updateFromInfo(entityInfo as PlayerInfo);
        //             }
                        
        //         }
        //     }
        // );

        // eventBus.on(EventBusMessage.ENTITY_DIED, (res:{entityInfo:EntityInfo, killerId:string})=>{
        //     for (const bot of this.botManager.getBots()) {
        //         if(res.entityInfo.id == bot.id){
        //             bot.die();
        //             this.botManager.deleteBot(bot.id);
        //         }
                    
        //     }
        // });

        // eventBus.on(EventBusMessage.ATTACK_RECEIVED, (res:{attackReceivedData: AttackReceivedData, entityId: string}) => {
        //     for (const bot of this.botManager.getBots()) {
        //         if(bot.id === res.entityId)
        //             bot.handleAttackReceived(res.attackReceivedData);
        //     }  
        // })

        // eventBus.on(EventBusMessage.ENTITY_RECEIVED_KNOCKBACK, (res:{knockbackData: KnockbackData, entityId: string}) => {
        //     for (const bot of this.botManager.getBots()) {
        //         if(bot.id === res.entityId)
        //             bot.handleKnockbackReceived(res.knockbackData);
        //     }  
        // })
    }
}
