import type { AttackData } from "../../../../shared/AttackData";
import { PlayerState } from "../../../../shared/PlayerState";
import type Position from "../../../../shared/Position";
import { AttackHitboxService } from "../AttackHitboxService";
import { Weapon } from "./Weapon";

export class HeavyWeapon extends Weapon {
    constructor() {
        super(20, 20, 20, 2)
    }

    public useWeapon(playerPos: Position, attackDir: number): AttackData {
        this._attackCurrentCombo = ((this._attackCurrentCombo + 1)% this._attackMaxCombo)
        return {
            hitbox: AttackHitboxService.createHitbox(playerPos, attackDir, 70),
            playerId: "",
            position: playerPos,
            rotation: attackDir,
            knockbackStrength: 20,
            playerAction: PlayerState.ATTACK_1,
        };
    }
}