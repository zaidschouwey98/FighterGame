import { Direction } from "../enums/Direction";
import { EntityInfo } from "../messages/EntityInfo";
import { EntityState } from "../messages/EntityState";
import PlayerInfo from "../messages/PlayerInfo";
import Position from "../Position";
import { AttackDataBase } from "../types/AttackData";
import { AttackReceivedData, AttackResult, KnockbackData } from "../types/AttackResult";

// export enum EventBusMessage{
//     CONNECTED,
//     ENTITIES_INIT,
//     ENTITY_UPDATED,
//     ENTITY_ADDED,
//     ENTITY_POSITION_UPDATED,
//     ENTITY_DIRECTION_UPDATED,
//     ENTITY_SYNC,
//     ENTITY_DIED,
//     ENTITY_RECEIVED_KNOCKBACK,
//     PLAYER_LEFT,
//     START_ATTACK,
//     ATTACK_RECEIVED,
//     PLAYER_RESPAWNED,
//     LOCAL_PLAYER_UPDATED,
//     LOCAL_ATTACK_PERFORMED,
//     LOCAL_PLAYER_POSITION_UPDATED,
//     LOCAL_PLAYER_DIRECTION_UPDATED,
//     LOCAL_PLAYER_MOVING,
//     ATTACK_RESULT,
//     TELEPORT_DESTINATION_HELPER,
// }

export enum EntityEvent {
    ADDED = "ENTITY_ADDED",
    REMOVED = "ENTITY_REMOVED",
    UPDATED = "ENTITY_UPDATED",
    POSITION_UPDATED = "POSITION_UPDATED",
    MOVING_VECTOR_CHANGED = "ENTITY_DIRECTION_CHANGED",
    SYNC = "ENTITY_SYNC",
    START_ATTACK = "ENTITY_START_ATTACK",
    RECEIVE_ATTACK = "ENTITY_RECEIVE_ATTACK",
    KNOCKBACKED = "ENTITY_KNOCKBACKED",
    DIED = "ENTITY_DIED",
    RESPAWNED = "ENTITY_RESPAWNED",
    BLOCK = "BLOCK",
    STATE_CHANGED = "STATE_CHANGED",
}

export enum LocalPlayerEvent {
    UPDATED = "LOCAL_PLAYER_UPDATED",
    MOVING = "LOCAL_PLAYER_MOVING",
    POSITION_UPDATED = "LOCAL_PLAYER_POSITION_UPDATED",
    DIRECTION_UPDATED = "LOCAL_PLAYER_DIRECTION_UPDATED",
    ATTACK_PERFORMED = "LOCAL_PLAYER_ATTACK_PERFORMED",
    ATTACK_RESULT = "ATTACK_RESULT",
    LEFT = "LEFT",
}

export enum NetworkEvent {
    CONNECTED = "NETWORK_CONNECTED",
    ENTITIES_INIT = "NETWORK_ENTITIES_INIT",
    PLAYER_LEFT = "NETWORK_PLAYER_LEFT",
}


interface EventPayloads {
    // --- EntityEvent ---
  [EntityEvent.ADDED]: EntityInfo;
  [EntityEvent.REMOVED]: string; // entityId
  [EntityEvent.UPDATED]: EntityInfo;
  [EntityEvent.POSITION_UPDATED]: { entityId: string; position: Position };
  [EntityEvent.MOVING_VECTOR_CHANGED]: { entityId: string; movingVector: { dx: number; dy: number }, state: EntityState, movingDirection: Direction };
  [EntityEvent.SYNC]: EntityInfo;
  [EntityEvent.STATE_CHANGED]: { entityId: string, state: EntityState};

  [EntityEvent.START_ATTACK]: { entityId: string; attackData: AttackDataBase };
  [EntityEvent.RECEIVE_ATTACK]: { entityId: string; attackReceivedData: AttackReceivedData };
  [EntityEvent.KNOCKBACKED]: { entityId: string; knockbackData: KnockbackData };
  [EntityEvent.DIED]: { entityInfo: EntityInfo; killerId?: string };
  [EntityEvent.RESPAWNED]: PlayerInfo;
  [EntityEvent.BLOCK]: { entityId: string };

  // ---- Local Player Events ----
  [LocalPlayerEvent.LEFT]: string; // playerId
  [LocalPlayerEvent.UPDATED]: PlayerInfo;
  [LocalPlayerEvent.MOVING]: PlayerInfo;
  [LocalPlayerEvent.POSITION_UPDATED]: PlayerInfo;
  [LocalPlayerEvent.DIRECTION_UPDATED]: PlayerInfo;
  [LocalPlayerEvent.ATTACK_PERFORMED]: AttackDataBase;
  [LocalPlayerEvent.ATTACK_RESULT]: { entityId: string; attackResult: AttackResult };

  // ---- Network Events ----
  [NetworkEvent.CONNECTED]: string; // socketId
  [NetworkEvent.ENTITIES_INIT]: EntityInfo[];
  [NetworkEvent.PLAYER_LEFT]: string; // playerId
}


type EventHandler<K extends keyof EventPayloads> = (data: EventPayloads[K]) => void;

export class EventBus {
    private listeners = new Map<any, Function[]>();

    on<K extends keyof EventPayloads>(event: K, handler: EventHandler<K>) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)!.push(handler);
    }

    emit<K extends keyof EventPayloads>(event: K, data: EventPayloads[K]) {
        this.listeners.get(event)?.forEach(h => h(data));
    }
}

