import { Socket } from "socket.io";
import { ServerState } from "../ServerState";
import PlayerInfo from "../../shared/messages/PlayerInfo";
import { AttackHandler, MeleeAttackHandler, ProjectileAttackHandler } from "./AttackHandler";
import { DamageSystem } from "./DamageSystem";
import { AttackDataBase, AttackType } from "../../shared/types/AttackData";
import { EventBus, EntityEvent } from "../../shared/services/EventBus";

export class AttackSystem {
    private handlers: Map<AttackType, AttackHandler> = new Map()

    constructor(private serverState: ServerState, private eventBus:EventBus) { 
        const damageSystem = new DamageSystem(serverState,eventBus);
        this.handlers.set(AttackType.MELEE, new MeleeAttackHandler(serverState, eventBus, damageSystem));
        this.handlers.set(AttackType.PROJECTILE, new ProjectileAttackHandler(serverState, eventBus, damageSystem));
    }

    handleAttack(data: AttackDataBase, socket?:Socket) {
        const handler = this.handlers.get(data.attackType);
        handler?.handle(data, socket);
    }

    public handleStartAttack(playerInfo:PlayerInfo, socket?:Socket) {
        if (this.serverState.playerExists(playerInfo.id)) {
            this.serverState.updatePlayer(playerInfo);
            this.eventBus.emit(EntityEvent.UPDATED, playerInfo);
        }
    }
}
