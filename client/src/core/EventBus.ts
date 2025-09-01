type EventHandler = (data: any) => void;

export class EventBus {
    private listeners: Map<string, EventHandler[]> = new Map();

    on(event: string, handler: EventHandler) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)!.push(handler);
    }

    emit(event: string, data?: any) {
        this.listeners.get(event)?.forEach(h => h(data));
    }
}
