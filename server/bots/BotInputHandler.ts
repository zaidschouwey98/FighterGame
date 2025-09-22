// server/bots/BotInputHandler.ts
import { IInputHandler } from "../../client/src/core/IInputHandler";
import type PlayerInfo from "../../shared/PlayerInfo";

export class BotInputHandler implements IInputHandler {
    private keys = new Set<string>();
    private mouse = { x: 0, y: 0 };
    private attack = false;
    private rightClick = false;
    private space = false;

    /** IA simple : suit la cible la plus proche et attaque si distance < attackDist */
    public think(self: PlayerInfo, others: PlayerInfo[], attackDist = 90) {
        this.keys.clear();
        this.attack = false;

        // chercher la cible la plus proche (hors soi et morts)
        let target: PlayerInfo | undefined;
        let best = Infinity;
        for (const p of others) {
            if (!p || p.id === self.id || p.isDead) continue;
            const dx = p.position.x - self.position.x;
            const dy = p.position.y - self.position.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) { best = d2; target = p; }
        }
        if (!target) {
            // errer doucement
            if (Math.random() < 0.02) {
                const choices = [["w"], ["s"], ["a"], ["d"], []][Math.floor(Math.random() * 5)];
                choices.forEach(k => this.keys.add(k));
            }
            return;
        }

        // déplacement vers la cible
        if (target.position.x > self.position.x + 5) this.keys.add("d");
        if (target.position.x < self.position.x - 5) this.keys.add("a");
        if (target.position.y > self.position.y + 5) this.keys.add("s");
        if (target.position.y < self.position.y - 5) this.keys.add("w");
        // viser et attaquer
        this.mouse = { x: target.position.x, y: target.position.y };
        if (Math.sqrt(best) < attackDist) {
            // this.attack = true;
        }
    }

    // IInputHandler
    getKeys() { return this.keys; }
    getMousePosition() { return this.mouse; }

    consumeAttack() { const a = this.attack; this.attack = false; return a; }
    consumeRightClick() { const r = this.rightClick; this.rightClick = false; return r; }
    consumeSpaceClick() { const s = this.space; this.space = false; return s; }

    update() {
        // rien de spécial à reset ici (consume* gèrent déjà)
    }
}
