import { EventBus, NetworkEvent } from "../../shared/services/EventBus";

export class EntityEventDispatcher {
    constructor(
        private eventBus: EventBus
    ) {
        this.eventBus.on(NetworkEvent.ENTITIES_INIT, ()=> {

        })
    }
}