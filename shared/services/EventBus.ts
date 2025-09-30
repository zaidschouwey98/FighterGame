import { Direction } from "../enums/Direction";
import { EntityInfo } from "../messages/EntityInfo";
import { EntityState } from "../messages/EntityState";
import PlayerInfo from "../messages/PlayerInfo";
import Position from "../Position";
import { AttackDataBase } from "../types/AttackData";
import { AttackReceivedData, AttackResult, KnockbackData } from "../types/AttackResult";

export enum EntityEvent {
    ADDED = "ENTITY_ADDED",
    REMOVED = "ENTITY_REMOVED",
    UPDATED = "ENTITY_UPDATED",
    POSITION_UPDATED = "POSITION_UPDATED",
    MOVING_VECTOR_CHANGED = "ENTITY_DIRECTION_CHANGED",
    SYNC = "ENTITY_SYNC",
    // START_ATTACK = "ENTITY_START_ATTACK",
    RECEIVE_ATTACK = "ENTITY_RECEIVE_ATTACK",
    KNOCKBACKED = "ENTITY_KNOCKBACKED",
    DIED = "ENTITY_DIED",
    RESPAWNED = "ENTITY_RESPAWNED",
    BLOCK = "BLOCK",
    STATE_CHANGED = "STATE_CHANGED",
    ATTACK = "ATTACK",
}

export enum EntityCommand {
    ATTACK = "ENTITY_COMMAND_ATTACK",
    BLOCK = "ENTITY_COMMAND_BLOCK",
    MOVE = "ENTITY_COMMAND_MOVE",
    POSITION_UPDATED = "ENTITY_COMMAND_POSITION_UPDATED",
    MOVING_VECTOR_CHANGED = "ENTITY_COMMAND_MOVING_VECTOR_CHANGED",
    UPDATED = "ENTITY_COMMAND_UPDATED",
    STATE_CHANGED = "STATE_CHANGED",
}

export enum LocalPlayerEvent {
    UPDATED = "LOCAL_PLAYER_UPDATED",
    MOVING = "LOCAL_PLAYER_MOVING",
    POSITION_UPDATED = "LOCAL_PLAYER_POSITION_UPDATED",
    DIRECTION_UPDATED = "LOCAL_PLAYER_DIRECTION_UPDATED",
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
    [EntityEvent.STATE_CHANGED]: { entityId: string, state: EntityState };

    [EntityEvent.ATTACK]: { entityId: string, attackData: AttackDataBase };
    [EntityEvent.RECEIVE_ATTACK]: { entityId: string; attackReceivedData: AttackReceivedData };
    [EntityEvent.KNOCKBACKED]: { entityId: string; knockbackData: KnockbackData };
    [EntityEvent.DIED]: { entityInfo: EntityInfo; killerId?: string };
    [EntityEvent.RESPAWNED]: PlayerInfo;
    [EntityEvent.BLOCK]: { entityId: string };

    // ---- Entity Commands ----
    [EntityCommand.ATTACK]: { entityId: string; attackData: AttackDataBase };
    [EntityCommand.BLOCK]: { entityId: string };
    [EntityCommand.POSITION_UPDATED]: { entityId: string; position: Position };
    [EntityCommand.MOVE]: { entityId: string; position: Position };
    [EntityCommand.MOVING_VECTOR_CHANGED]: { entityId: string; movingVector: { dx: number; dy: number }, state: EntityState, movingDirection: Direction };
    [EntityCommand.UPDATED]: EntityInfo;
    [EntityCommand.STATE_CHANGED]: { entityId: string, state: EntityState };


    // ---- Local Player Events ----
    [LocalPlayerEvent.LEFT]: string; // playerId
    [LocalPlayerEvent.UPDATED]: PlayerInfo;
    [LocalPlayerEvent.MOVING]: PlayerInfo;
    [LocalPlayerEvent.POSITION_UPDATED]: PlayerInfo;
    [LocalPlayerEvent.DIRECTION_UPDATED]: PlayerInfo;
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

