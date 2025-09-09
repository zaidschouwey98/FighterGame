import { Direction } from "../../../shared/Direction";



export default class AnimHelper {

  static getDirectionByVector(
    vector: { x: number; y: number },
    allowed: Direction[]
  ): Direction {
    const { x, y } = vector;
    const len = Math.sqrt(x * x + y * y) || 1;
    const nx = x / len;
    const ny = y / len;

    // Angle en degrés
    const angle = (Math.atan2(ny, nx) * 180) / Math.PI; // -180..180

    // Définition des angles par direction
    const directionAngles: Record<Direction, number> = {
      [Direction.RIGHT]: 0,
      [Direction.TOP_RIGHT]: -45,
      [Direction.TOP]: -90,
      [Direction.TOP_LEFT]: -135,
      [Direction.LEFT]: 180,
      [Direction.BOTTOM_LEFT]: 135,
      [Direction.BOTTOM]: 90,
      [Direction.BOTTOM_RIGHT]: 45,
      [Direction.NONE]: 0,
    };

    // Filtrer par allowed
    let bestDir = allowed[0];
    let bestDiff = 9999;

    for (const dir of allowed) {
      const dirAngle = directionAngles[dir];
      let diff = Math.abs(angle - dirAngle);
      if (diff > 180) diff = 360 - diff; // Corriger wrap
      if (diff < bestDiff) {
        bestDiff = diff;
        bestDir = dir;
      }
    }

    return bestDir;
  }


}
