import { EntityInfo } from "../shared/EntityInfo";
import PlayerInfo from "../shared/PlayerInfo"

// server/HitboxValidationService.ts
export class HitboxValidationService {
    static isPositionInHitbox(
        targetPos: { x: number; y: number },
        hitbox: { x: number; y: number; angle: number; range: number; arcAngle: number }
    ): boolean {
        // 1. Vérifier la distance
        const dx = targetPos.x - hitbox.x;
        const dy = targetPos.y - hitbox.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > hitbox.range) {
            return false;
        }

        // 2. Vérifier l'angle (est-ce dans l'arc d'attaque ?)
        const targetAngle = Math.atan2(dy, dx);
        const angleDifference = Math.abs(targetAngle - hitbox.angle);
        
        // Normaliser l'angle entre -π et π
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDifference), Math.cos(angleDifference));

        return Math.abs(normalizedAngleDiff) <= hitbox.arcAngle / 2;
    }

    static getTargetsInHitbox(
        hitbox: any,
        players: EntityInfo[],
        excludePlayerId: string
    ): string[] {
        const hitPlayers: string[] = [];

        for (const player of players) {
            if (player.id === excludePlayerId) continue;

            if (this.isPositionInHitbox(player.position, hitbox)) {
                hitPlayers.push(player.id);
            }
        }

        return hitPlayers;
    }
}