import { BLOCK_COOLDOWN } from "../constantes";
import type { IInputHandler } from "../../client/src/core/IInputHandler";
import type { Player } from "../entities/Player";


export class BlockService {
  private blockCooldown = BLOCK_COOLDOWN;

  constructor(
    private inputHandler: IInputHandler,
  ) { }

  public getBlockCD():number{
    return this.blockCooldown;
  }

  public resetBlockCD(){
    this.blockCooldown = BLOCK_COOLDOWN;
  }

  public startBlock(player: Player) {
    const worldMousePos = this.inputHandler.getMousePosition();
    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    player.aimVector = { x: dx / len, y: dy / len };
  }

  public update(delta: number) {
    // Réduit le cooldown
    if (this.blockCooldown > 0) {
      this.blockCooldown -= delta;
    }
  }
}