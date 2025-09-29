import PlayerInfo from "../../shared/messages/PlayerInfo";
import { ServerState } from "../ServerState";
import { Player } from "../../shared/entities/Player";
import { EntityEvent, EventBus } from "../../shared/services/EventBus";
import { EntityInfo } from "../../shared/messages/EntityInfo";
import { EntityType } from "../../shared/enums/EntityType";

export class ProgressionSystem {
    constructor(private serverState: ServerState, private eventBus: EventBus) {
        this.registerListeners();
    }

    private registerListeners() {
        this.eventBus.on(EntityEvent.DIED, (res: { entityInfo: EntityInfo; killerId?: string }) => {
            if (!res.killerId) return;
            if(res.entityInfo.entityType !== EntityType.PLAYER) return;
            const entityInfo = res.entityInfo as PlayerInfo;
            const killer = this.serverState.getEntity(res.killerId) as Player;
            if (!killer) return;
            killer.hp = Math.min(killer.hp + 10, killer.maxHp);
            killer.killCounter += 1;
            killer.killStreak += 1;
            this.gainXp(killer, killer.currentLvl <= entityInfo.currentLvl ? this.getXpByKilledLevel(entityInfo.currentLvl)/2 : 100);

            this.checkLevelUp(killer);
            this.eventBus.emit(EntityEvent.SYNC, killer.toInfo());
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
            player.attackSpeed *= 1.05; // ex: -10% cooldown
            player.hp = player.maxHp += 20; // ex: +20 HP max
        }
    }

    private getNextLvlXp(lvl: number): number {
        return 100 + lvl * 50; // ex: courbe de progression
    }
}
