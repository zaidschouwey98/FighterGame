import type PlayerInfo from "../../../../shared/PlayerInfo";
import type { Observer } from "./Observer";

export class Subject {
    private observers:Observer[];
    constructor(){
        this.observers = [];
    }

    addObserver(observer:Observer){
        this.observers.push(observer);
    }
    
    notify(playerInfo:PlayerInfo[]){
        for(const observer of this.observers){
            observer.onNotify(playerInfo);
        }
    }
}