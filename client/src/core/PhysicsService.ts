export class PhysicsService {
  static computeKnockback(source: {x:number,y:number}, target: {x:number,y:number}, force: number): {x:number,y:number} {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: (dx / len) * force, y: (dy / len) * force };
  }
}