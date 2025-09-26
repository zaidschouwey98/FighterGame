import { IInputHandler } from "../../client/src/core/IInputHandler";
import { EntityInfo } from "../../shared/EntityInfo";
import type PlayerInfo from "../../shared/PlayerInfo";

export class BotInputHandler implements IInputHandler {
    private keys = new Set<string>();
    private mouse = { x: 0, y: 0 };
    private attack = false;
    private rightClick = false;
    private space = false;

    public think(self: PlayerInfo, others: EntityInfo[], attackDist = 90, dangerDist = 70) {
        this.keys.clear();
        this.attack = false;
        this.rightClick = false;
        this.space = false;

        let target: EntityInfo | undefined;
        let best = Infinity;

        for (const p of others) {
            if (!p || p.id === self.id || p.isDead) continue;
            const dx = p.position.x - self.position.x;
            const dy = p.position.y - self.position.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) {
                best = d2;
                target = p;
            }
        }

        if (!target) {
            // errer aléatoirement
            if (Math.random() < 0.02) {
                const choices = [["w"], ["s"], ["a"], ["d"], []][Math.floor(Math.random() * 5)];
                choices.forEach(k => this.keys.add(k));
            }
            return;
        }

        const dist = Math.sqrt(best);

        // viser en permanence la cible par défaut
        this.mouse = { x: target.position.x, y: target.position.y };

        // déplacement vers la cible
        if (target.position.x > self.position.x + 5) this.keys.add("d");
        if (target.position.x < self.position.x - 5) this.keys.add("a");
        if (target.position.y > self.position.y + 5) this.keys.add("s");
        if (target.position.y < self.position.y - 5) this.keys.add("w");

        // attaque si assez proche
        if (dist < attackDist) {
            // this.attack = true;
        }

        // blocage défensif
        // if (dist < dangerDist && target.hp > 0) {
        //     if (Math.random() < 0.3) {
        //         this.rightClick = true;
        //     }
        // }

        // // dash
        // if (self.hp < 30 && dist < 150 && Math.random() < 0.5) {
        //     // dash défensif → souris à l'opposé du joueur
        //     const dx = self.position.x - target.position.x;
        //     const dy = self.position.y - target.position.y;
        //     this.mouse = { x: self.position.x + dx, y: self.position.y + dy };
        //     this.space = true;
        // } else if (dist < 120 && dist > 80 && Math.random() < 0.05) {
        //     // dash offensif → souris sur la cible
        //     this.mouse = { x: target.position.x, y: target.position.y };
        //     this.space = true;
        // }
    }

    getKeys() { return this.keys; }
    getMousePosition() { return this.mouse; }

    consumeAttack() { const a = this.attack; this.attack = false; return a; }
    consumeRightClick() { const r = this.rightClick; this.rightClick = false; return r; }
    consumeSpaceClick() { const s = this.space; this.space = false; return s; }

    update() {}
}
