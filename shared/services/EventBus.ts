type EventHandler = (data: any) => void;
export enum EventBusMessage{
    CONNECTED,
    PLAYERS_INIT,
    PLAYER_UPDATED,
    LOCAL_PLAYER_UPDATED,
    PLAYER_JOINED,
    PLAYER_LEFT,
    START_ATTACK,
    PLAYER_DIED,
    ATTACK_RESULT,
    LOCAL_ATTACK_PERFORMED,
    PLAYER_RESPAWNED,
    PLAYER_POSITION_UPDATED,
    LOCAL_PLAYER_POSITION_UPDATED,
    LOCAL_PLAYER_DIRECTION_UPDATED,
    LOCAL_PLAYER_MOVING,
    PLAYER_DIRECTION_UPDATED,
    PLAYER_PROGRESSED
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
