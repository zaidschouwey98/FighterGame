export class PhysicsService {
  static computeKnockback(source: {x:number,y:number}, target: {x:number,y:number}, force: number): {dx:number,dy:number} {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { dx: (dx / len) * force, dy: (dy / len) * force };
  }

  /**
   * True si la direction de parade (aim) fait face à la source
   * dans le cône défini par minDot (= cos demi-angle).
   */
  static isFacingSource(
    defenderPos: { x: number; y: number },
    aimVector: { x: number; y: number },
    sourcePos: { x: number; y: number },
    minDot: number
  ): boolean {
    const toSourceX = sourcePos.x - defenderPos.x;
    const toSourceY = sourcePos.y - defenderPos.y;
    const toSourceLen = Math.sqrt(toSourceX * toSourceX + toSourceY * toSourceY) || 1;

    const aimLen = Math.sqrt(aimVector.x * aimVector.x + aimVector.y * aimVector.y);
    if (aimLen < 1e-6) return false;

    const fx = aimVector.x / aimLen;
    const fy = aimVector.y / aimLen;
    const sx = toSourceX / toSourceLen;
    const sy = toSourceY / toSourceLen;

    return fx * sx + fy * sy >= minDot;
  }
}