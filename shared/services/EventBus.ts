type EventHandler = (data: any) => void;
export enum EventBusMessage{
    CONNECTED,
    ENTITIES_INIT,
    ENTITY_UPDATED,
    ENTITY_ADDED,
    ENTITY_POSITION_UPDATED,
    ENTITY_DIRECTION_UPDATED,
    ENTITY_SYNC,
    ENTITY_DIED,
    ENTITY_RECEIVED_KNOCKBACK,
    PLAYER_LEFT,
    START_ATTACK,
    ATTACK_RECEIVED,
    PLAYER_RESPAWNED,
    LOCAL_PLAYER_UPDATED,
    LOCAL_ATTACK_PERFORMED,
    LOCAL_PLAYER_POSITION_UPDATED,
    LOCAL_PLAYER_DIRECTION_UPDATED,
    LOCAL_PLAYER_MOVING,
    ATTACK_RESULT,
    TELEPORT_DESTINATION_HELPER,
}
export class EventBus {
    private listeners: Map<EventBusMessage, EventHandler[]> = new Map();

    on(event: EventBusMessage, handler: EventHandler) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)!.push(handler);
    }

    emit(event: EventBusMessage, data?: any) {
        this.listeners.get(event)?.forEach(h => h(data));
    }
}
