import { Socket } from "socket.io";
import { ServerState } from "../ServerState";
import { AttackDataBase, AttackType } from "../../shared/AttackData";
import PlayerInfo from "../../shared/PlayerInfo";
import { EventBus, EventBusMessage } from "../../shared/services/EventBus";
import { AttackHandler, MeleeAttackHandler, ProjectileAttackHandler } from "./AttackHandler";

export class AttackSystem {
    private handlers: Map<AttackType, AttackHandler> = new Map()

    constructor(private serverState: ServerState, private eventBus:EventBus) { 
        this.handlers.set(AttackType.MELEE, new MeleeAttackHandler(serverState, eventBus));
        this.handlers.set(AttackType.PROJECTILE, new ProjectileAttackHandler(serverState, eventBus));
    }

    handleAttack(data: AttackDataBase, socket?:Socket) {
        const handler = this.handlers.get(data.attackType);
        handler?.handle(data, socket);
    }

    public handleStartAttack(playerInfo:PlayerInfo, socket?:Socket) {
        if (this.serverState.playerExists(playerInfo.id)) {
            this.serverState.updatePlayer(playerInfo);
            this.eventBus.emit(EventBusMessage.START_ATTACK, {playerInfo:this.serverState.getPlayer(playerInfo.id).toInfo(), socket:socket})
        }
    }
}
