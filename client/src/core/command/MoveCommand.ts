import type { Player } from "../../../../shared/player/Player";
import { Command } from "./Command";

export class MoveCommand extends Command{
    execute(player:Player): void {
        player.changeState(player.movingState);
    }
    
}