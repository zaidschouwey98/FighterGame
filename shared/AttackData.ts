import { Action } from "./Action";

export interface AttackData {
    playerId: string;
    position: { x: number; y: number };
    rotation: number;
    hitbox: {
        x: number;
        y: number;
        angle: number;
        range: number;
        arcAngle: number;
    };
    playerAction:Action;
}