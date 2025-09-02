import { AttackHitboxService } from "./AttackHitboxService";
import { NetworkClient } from "../network/NetworkClient";
import { CoordinateService } from "./CoordinateService";
import { InputHandler } from "./InputHandler";
import type Player from "../../../shared/Player";
import { Action } from "../../../shared/Action";

export class AttackService {
    constructor(
        private inputHandler: InputHandler,
        private coordinateService: CoordinateService,
        private network: NetworkClient
    ) {}

    public initiateAttack(player: Player) {
        const mousePos = this.inputHandler.getMousePosition();
        const worldMousePos = this.coordinateService.screenToWorld(mousePos.x, mousePos.y);
        const dx = worldMousePos.x - player.position.x;
        const dy = worldMousePos.y - player.position.y;
        let dir = Math.atan2(dy, dx);

        const dashDistance = 40;
        const dashFrames = 14;
        player.dashVelocity = {
            x: Math.cos(dir) * dashDistance / dashFrames,
            y: Math.sin(dir) * dashDistance / dashFrames
        };
        player.dashTimer = dashFrames;
        (player as any).pendingAttackDir = dir;
        (player as any).pendingAttack = true;
    }

    public performAttack(player: Player, dir: number) {
        player.currentAction = Action.ATTACK_1;

        const hitbox = AttackHitboxService.createHitbox(player.position, dir);

        this.network.attack({
            playerId: player.id,
            position: { ...player.position },
            rotation: dir,
            hitbox,
            playerAction: Action.ATTACK_1
        });
    }
}
