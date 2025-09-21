export class AttackHitboxService {
    private static readonly DEFAULT_RANGE = 60;
    private static readonly DEFAULT_ARC_ANGLE = Math.PI // 180 degrés

    static createHitbox(
        position: { x: number; y: number },
        rotation: number,
        range: number = this.DEFAULT_RANGE,
        arcAngle: number = this.DEFAULT_ARC_ANGLE
    ) {
        return {
            x: position.x,
            y: position.y,
            angle: rotation, // Même angle que la rotation de l'attaque
            range: range,
            arcAngle: arcAngle
        };
    }

    static calculateHitboxForDirection(
        position: { x: number; y: number },
        rotation: number
    ) {
        return this.createHitbox(position, rotation);
    }
}