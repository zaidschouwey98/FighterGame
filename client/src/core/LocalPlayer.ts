import type { Action } from "../../../shared/Action";
import Player from "../../../shared/Player";
import Position from "../../../shared/Position";
import type { NetworkClient } from "../network/NetworkClient";

export class LocalPlayer extends Player {
    public networkClient?: NetworkClient;

    constructor(position:Position, hp:number, speed:number, id:string){
        super(position, hp, speed, id);
    }

    public set currentAction(action: Action) {
        if(this.networkClient == undefined)
            throw new Error("LocalPlayer networkclient shouldn't be undefined.");
        if(this._currentAction == action)
            return;
        this._currentAction = action;
        this.networkClient.actionUpdated(action)
    }

    public get currentAction() {
        return this._currentAction;
    }

}