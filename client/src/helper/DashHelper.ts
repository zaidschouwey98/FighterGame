import { PlayerState } from "../../../shared/PlayerState";

export default class DashHelper {
    public static getDashAttackActionByVector(vector: { x: number, y: number }): PlayerState {
        const angle = Math.atan2(vector.y, vector.x);
        const deg = (angle * 180) / Math.PI;

        if (deg >= -22.5 && deg < 22.5) return PlayerState.ATTACK_DASH_RIGHT;
        if (deg >= 22.5 && deg < 67.5) return PlayerState.ATTACK_DASH_BOTTOM_RIGHT;
        if (deg >= 67.5 && deg < 112.5) return PlayerState.ATTACK_DASH_BOTTOM;
        if (deg >= 112.5 && deg < 157.5) return PlayerState.ATTACK_DASH_BOTTOM_LEFT;
        if (deg >= 157.5 || deg < -157.5) return PlayerState.ATTACK_DASH_LEFT;
        if (deg >= -157.5 && deg < -112.5) return PlayerState.ATTACK_DASH_TOP_LEFT;
        if (deg >= -112.5 && deg < -67.5) return PlayerState.ATTACK_DASH_TOP;
        if (deg >= -67.5 && deg < -22.5) return PlayerState.ATTACK_DASH_TOP_RIGHT;

        return PlayerState.ATTACK_DASH_RIGHT; // fallback
    }

    public static dashSpeedFactor(t: number, freezeRatio = 0.25, p = 3): number {
        if (t < freezeRatio) return 0;

        // Re-normalisation du temps après freeze
        const tPrime = (t - freezeRatio) / (1 - freezeRatio);

        // Courbe polynôme symétrique
        return Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
    }
}