import type { EntityInfo } from "../../../shared/EntityInfo";

export class GameState{
    private static _instance: GameState;
    public entities: Map<string, EntityInfo> = new Map();


    public static get instance(): GameState {
        if (!GameState._instance) GameState._instance = new GameState();
        return GameState._instance;
    }

    addEntity(info: EntityInfo) {
        console.log(info)
        this.entities.set(info.id, info);
    }

    updateEntity(info: EntityInfo) {
        let entity = this.entities.get(info.id);
        if (!entity) {
            console.warn(`Entity ${info.id} not found`);
            // this.addPlayer(info);
            return;
        }
        
        this.entities.set(info.id,info);
    }

    restoreEntities(infos: EntityInfo[]) {
        this.entities.clear();
        for (const info of infos) {
            this.addEntity(info);
        }
    }

    removeEntity(id: string) {
        if(this.entities.get(id) == undefined)
            throw new Error("Trying to remove undefined entity.");
        this.entities.delete(id);
    }

    getEntity(id: string): EntityInfo | undefined {
        return this.entities.get(id);
    }
}
