export class AttackDirectionCalculator {
    static calculateDirection(
        playerPosition: { x: number; y: number },
        mousePosition: { x: number; y: number }
    ): number {
        const dx = mousePosition.x - playerPosition.x;
        const dy = mousePosition.y - playerPosition.y;
        return Math.atan2(dy, dx);
    }
}