import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { BotManager } from "../BotManager";


export class BotAdapter {
    constructor(private botManager: BotManager, private eventBus: EventBus) {}

    start() {
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult) => {
            // const attackerBot = this.botManager.getBot(attackResult.attackerId);
            // if (attackerBot) {
            //     attackerBot.handleAttackResult(attackResult);
            // }

            // for (const hit of attackResult.hitPlayers) {
            //     const hitBot = this.botManager.getBot(hit.id);
            //     if (hitBot) {
            //         hitBot.handleAttackReceived(hit);
            //     }
            // }
        });
    }
}
