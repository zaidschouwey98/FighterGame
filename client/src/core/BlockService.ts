import { Action } from "../../../shared/Action";
import type { NetworkClient } from "../network/NetworkClient";
import type { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type { LocalPlayer } from "./LocalPlayer";


export class BlockService {
  private blockDuration = 40; // frames todo CONSTANTE fix aussi pour par qu'on puisse faire autre chose (marche pas quand set a 10000)
  private blockCooldown = 40;
  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService,
    private network: NetworkClient
  ) { }


  public startBlock(player: LocalPlayer) {
    if (player.isBlocking) return;
    if (this.blockCooldown > 0) {
      return;
    }
    player.blockTimer = this.blockDuration;
    player.isBlocking = true;

    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    // Direction du dash
    player.blockDir = { x: dx / len, y: dy / len };

    player.currentAction = this.getBlockDirection(dx,dy); // TOdo block_right, left, top, down
    // Réseau : informer les autres joueurs
    this.network.block(player);
  }

  public update(player: LocalPlayer, detla: number) {
    if (this.blockCooldown > 0)
      this.blockCooldown -= detla;
    if (!player.isBlocking) return;

    if (player.blockTimer && player.blockTimer > 0) {
      player.blockTimer--;

    } else {
      // Fin du block
      this.blockCooldown = 40;

      player.isBlocking = false;
      player.blockTimer = undefined;

      switch (player.currentAction) {
        case Action.BLOCK_BOTTOM:
          player.currentAction = Action.IDLE_DOWN;
          break;
        case Action.BLOCK_TOP:
          player.currentAction = Action.IDLE_TOP;
          break;
        case Action.BLOCK_LEFT:
          player.currentAction = Action.IDLE_LEFT;
          break;
        case Action.BLOCK_RIGHT:
          player.currentAction = Action.IDLE_RIGHT;
          break;
        default:
          break;
      }

      this.network.blockEnd(player);
    }
  }

  private getBlockDirection(dx: number, dy: number): Action {
    if (Math.abs(dx) > Math.abs(dy)) {
      // Axe horizontal dominant
      return dx > 0 ? Action.BLOCK_RIGHT : Action.BLOCK_LEFT;
    } else {
      // Axe vertical dominant
      return dy > 0 ? Action.BLOCK_BOTTOM : Action.BLOCK_TOP;
    }
  }
}