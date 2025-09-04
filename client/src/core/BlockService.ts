import { Action } from "../../../shared/Action";
import type { NetworkClient } from "../network/NetworkClient";
import type { LocalPlayer } from "./LocalPlayer";


export class BlockService {
  private blockDuration = 20; // frames todo CONSTANTE fix aussi pour par qu'on puisse faire autre chose (marche pas quand set a 10000)
  private blockCooldown = 20;
  constructor(private network: NetworkClient) {}

  public startBlock(player: LocalPlayer) {
    if (player.isBlocking) return;

    player.blockTimer = this.blockDuration;
    player.isBlocking = true;

    
    player.currentAction = Action.BLOCK; // TOdo block_right, left, top, down
    // Réseau : informer les autres joueurs
    this.network.block(player);
  }

  public update(player: LocalPlayer) {
    if (!player.isBlocking) return;

    if (player.blockTimer && player.blockTimer > 0) {
      player.blockTimer--;
    } else {
      // Fin du block
      player.isBlocking = false;
      player.blockTimer = undefined;
      player.currentAction = Action.IDLE_DOWN // todo idle in direction of last block
      this.network.blockEnd(player);
    }
  }
}