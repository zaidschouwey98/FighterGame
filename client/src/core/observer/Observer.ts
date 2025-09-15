import type PlayerInfo from "../../../../shared/PlayerInfo";

export abstract class Observer {
    constructor(){

    }

    abstract onNotify(playerInfo:PlayerInfo[]):void;
}