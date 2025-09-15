import type Player from "../player/Player";

export abstract class Command {
    abstract execute(player:Player):void;
}