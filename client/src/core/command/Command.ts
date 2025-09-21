import type { Player } from "../../../../shared/player/Player";

export abstract class Command {
    abstract execute(player:Player):void;
}