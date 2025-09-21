import { IInputHandler } from "../../client/src/core/IInputHandler";
import {Player} from "../../shared/player/Player";

export class BotInputHandler implements IInputHandler {
    private keys: Set<string> = new Set();
    private mousePos = { x: 0, y: 0 };
    private attack = false;
    private rightClick = false;
    private space = false;

    think(bot: Player, players: Player[]) {
        this.keys.clear();
        this.attack = false;

        // const target = findClosest(bot, players);
        let target:any;
        if (!target) return;

        // Déplacement vers la cible
        if (target.position.x > bot.position.x) this.keys.add("d");
        if (target.position.x < bot.position.x) this.keys.add("a");
        if (target.position.y > bot.position.y) this.keys.add("s");
        if (target.position.y < bot.position.y) this.keys.add("w");

        // Viser et attaquer
        this.mousePos = { x: target.position.x, y: target.position.y };
        const dx = target.position.x - bot.position.x;
        const dy = target.position.y - bot.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) this.attack = true;
    }

    getKeys() { return this.keys; }
    getMousePosition() { return this.mousePos; }
    consumeAttack() { const a = this.attack; this.attack = false; return a; }
    consumeRightClick() { const r = this.rightClick; this.rightClick = false; return r; }
    consumeSpaceClick() { const s = this.space; this.space = false; return s; }
    update() { }
}
