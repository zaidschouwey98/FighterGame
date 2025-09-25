import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import PlayerInfo from "../../shared/PlayerInfo";
import { ServerState } from "../ServerState";
import { Player } from "../../shared/player/Player";

export class ProgressionSystem {
    constructor(private serverState: ServerState, private eventBus: EventBus) {
        this.registerListeners();
    }

    private registerListeners() {
        this.eventBus.on(EventBusMessage.ENTITY_DIED, ({ entityInfo, killerId }) => {
            if (!killerId) return;
            const killer = this.serverState.getPlayer(killerId);
            if (!killer) return;
            killer.hp = Math.min(killer.hp + 10, killer.maxHp);
            
            this.gainXp(killer, killer.currentLvl <= entityInfo.currentLvl ? this.getXpByKilledLevel(entityInfo.currentLvl)/2 : 100);

            this.checkLevelUp(killer);
            this.eventBus.emit(EventBusMessage.ENTITY_SYNC, killer.toInfo());
        });
    }

    private gainXp(player: Player, amount: number) {
        player.currentXp += amount;
    }

    private getXpByKilledLevel(lvl:number){
        let total = 0;
        if(lvl == 1)
            return 100;
        for(let i = 1; i <= lvl; i++){
            total += this.getNextLvlXp(i);
        }
        return total;
    }

    private checkLevelUp(player: Player) {
        if (player.currentXp >= player.lvlXp) {
            player.currentXp -= player.lvlXp;
            player.currentLvl++;
            player.lvlXp = this.getNextLvlXp(player.currentLvl);
            
            // upgrade stats
            player.attackSpeed *= 1.1; // ex: -10% cooldown
            player.hp = player.maxHp += 20; // ex: +20 HP max
        }
    }

    private getNextLvlXp(lvl: number): number {
        return 100 + lvl * 50; // ex: courbe de progression
    }
}
