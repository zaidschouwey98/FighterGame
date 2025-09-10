import { BLOCK_COOLDOWN } from "../constantes";
import type { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";


export class BlockService {
  private blockCooldown = BLOCK_COOLDOWN;

  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService,
  ) { }

  public getBlockCD():number{
    return this.blockCooldown;
  }

  public resetBlockCD(){
    this.blockCooldown = BLOCK_COOLDOWN;
  }

  public startBlock(player: Player, blockDuration:number) {
    player.blockTimer = blockDuration;
    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    player.mouseDirection = { x: dx / len, y: dy / len };
  }

  public update(delta: number) {
    // Réduit le cooldown
    if (this.blockCooldown > 0) {
      this.blockCooldown -= delta;
    }
  }
}