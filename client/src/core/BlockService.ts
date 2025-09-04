import { Action } from "../../../shared/Action";
import type Player from "../../../shared/Player";
import type { NetworkClient } from "../network/NetworkClient";


export class BlockService {
  private blockDuration = 20; // frames todo CONSTANTE
  private blockCooldown = 20;
  constructor(private network: NetworkClient) {}

  public startBlock(player: Player) {
    if (player.isBlocking) return;

    player.blockTimer = this.blockDuration;
    player.isBlocking = true;

    
    player.currentAction = Action.BLOCK;

    // Réseau : informer les autres joueurs
    this.network.block(player);
  }

  public update(player: Player) {
    if (!player.isBlocking) return;

    if (player.blockTimer && player.blockTimer > 0) {
      player.blockTimer--;
    } else {
      // Fin du block
      player.isBlocking = false;
      player.blockTimer = undefined;
      this.network.blockEnd(player);
    }
  }
}