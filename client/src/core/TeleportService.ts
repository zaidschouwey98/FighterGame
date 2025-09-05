import { Action } from "../../../shared/Action";
import { TP_COOLDOWN, TP_DISTANCE } from "../constantes";
import type { NetworkClient } from "../network/NetworkClient";
import type { CoordinateService } from "./CoordinateService";
import type { InputHandler } from "./InputHandler";
import type { LocalPlayer } from "./LocalPlayer";

export class TeleportService {
  private teleportCooldown = TP_COOLDOWN;
  private readonly teleportDistance = TP_DISTANCE;

  constructor(
    private inputHandler: InputHandler,
    private coordinateService: CoordinateService,
    private network: NetworkClient
  ) {}

  /**
   * Appelé chaque frame
   */
  public update(player: LocalPlayer, delta: number) {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= delta;
      if (this.teleportCooldown < 0) this.teleportCooldown = 0;
    }

    // Si espace est pressé et cooldown fini
    if (this.inputHandler.consumeSpaceClick() && this.teleportCooldown === 0) {
      this.teleportPlayer(player);
      this.teleportCooldown = TP_COOLDOWN; // Reset cooldown
    }
  }

  /**
   * Téléporte le joueur dans la direction de la souris
   */
  private teleportPlayer(player: LocalPlayer) {
    // Position souris dans le monde
    const mousePos = this.inputHandler.getMousePosition();
    const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);

    const dx = worldMousePos.x - player.position.x;
    const dy = worldMousePos.y - player.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);



    // Calcul nouvelle position // LEN POUR NORMALISER
    const newX = player.position.x + (dx / len) * this.teleportDistance;
    const newY = player.position.y + (dy / len) * this.teleportDistance;

    // Appliquer la position
    player.position.x = newX;
    player.position.y = newY;
    
    // Déclencher animation/action
    player.currentAction = Action.TELEPORT;

    // Synchroniser avec le serveur
    this.network.move({ x: newX, y: newY }, player.currentAction);

  }
}