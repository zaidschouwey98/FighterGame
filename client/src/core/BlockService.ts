import { PlayerState } from "../../../shared/PlayerState";
import { BLOCK_COOLDOWN, BLOCK_DURATION } from "../constantes";
import type { CoordinateService } from "./CoordinateService";
import { EventBusMessage, type EventBus } from "./EventBus";
import type { InputHandler } from "./InputHandler";
import type Player from "./player/Player";


export class BlockService {
  private blockDuration = BLOCK_DURATION; // frames todo CONSTANTE 
  private blockCooldown = BLOCK_COOLDOWN;
  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService,
    private eventBus: EventBus
  ) { }


  public startBlock(player: Player) {
    if (this.blockCooldown > 0) {
      return;
    }
    player.blockTimer = this.blockDuration;
    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    player.blockDir = { x: dx / len, y: dy / len };
    player.setState(PlayerState.BLOCKING);
    this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player);

  }

  public update(player: Player, delta: number) {
    // Réduit le cooldown
    if (this.blockCooldown > 0) {
      this.blockCooldown -= delta;
    }

    // Si pas en block, rien à faire
    if (player.blockTimer === undefined) return;

    // Réduit la durée du block
    player.blockTimer -= delta;

    if (player.blockTimer <= 0) {
      // Fin du block
      this.blockCooldown = BLOCK_COOLDOWN;
      player.blockTimer = undefined;
      player.setState(PlayerState.IDLE);
      this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player);
    }
  }
}