import { Action } from "../../../shared/Action";

export default class DashDirection{
    public static getDashActionByVelocity(velocity: { x: number, y: number }): Action {
        const angle = Math.atan2(velocity.y, velocity.x);
        const deg = (angle * 180) / Math.PI;

        if (deg >= -22.5 && deg < 22.5) return Action.ATTACK_DASH_RIGHT;
        if (deg >= 22.5 && deg < 67.5) return Action.ATTACK_DASH_BOTTOM_RIGHT;
        if (deg >= 67.5 && deg < 112.5) return Action.ATTACK_DASH_BOTTOM;
        if (deg >= 112.5 && deg < 157.5) return Action.ATTACK_DASH_BOTTOM_LEFT;
        if (deg >= 157.5 || deg < -157.5) return Action.ATTACK_DASH_LEFT;
        if (deg >= -157.5 && deg < -112.5) return Action.ATTACK_DASH_TOP_LEFT;
        if (deg >= -112.5 && deg < -67.5) return Action.ATTACK_DASH_TOP;
        if (deg >= -67.5 && deg < -22.5) return Action.ATTACK_DASH_TOP_RIGHT;

        return Action.ATTACK_DASH_RIGHT; // fallback
    }
}