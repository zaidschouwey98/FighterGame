import { Container, Graphics, Text, TextStyle } from "pixi.js";

const C = {
    bg: 0x0a1410,
    frame: 0xc4a35a,
    frameInner: 0x2a3d34,
    grid: 0x1e2e28,
    you: 0x5ec4b0,
    youRing: 0xb8f0e4,
    other: 0xe07a5f,
    otherEdge: 0xffb4a0,
    cross: 0x3d5c50,
    label: 0xf0e6c8,
};

export class Minimap {
    private root = new Container({ label: "minimap" });
    private dotsLayer = new Container();
    private localDot = new Graphics();
    private othersGfx = new Graphics();
    private mapSize: number;
    private scale = 0.1;

    constructor(uiContainer: Container, mapSize = 188) {
        this.mapSize = mapSize;

        // fond + cadre
        const frame = new Graphics();
        // ombre légère
        frame.roundRect(3, 3, mapSize, mapSize, 8).fill({ color: 0x000000, alpha: 0.35 });
        // bordure extérieure
        frame.roundRect(0, 0, mapSize, mapSize, 8)
            .fill({ color: C.bg, alpha: 0.92 })
            .stroke({ width: 2, color: C.frame, alpha: 0.9 });
        // filet intérieur
        frame.roundRect(4, 4, mapSize - 8, mapSize - 8, 5)
            .stroke({ width: 1, color: C.frameInner, alpha: 0.8 });
        this.root.addChild(frame);

        // grille
        const grid = new Graphics();
        const step = mapSize / 4;
        for (let i = 1; i < 4; i++) {
            const x = i * step;
            const y = i * step;
            grid.moveTo(x, 6).lineTo(x, mapSize - 6);
            grid.moveTo(6, y).lineTo(mapSize - 6, y);
        }
        grid.stroke({ width: 1, color: C.grid, alpha: 0.55 });
        this.root.addChild(grid);

        // croix centrale (repère)
        const cross = new Graphics();
        const cx = mapSize / 2;
        const cy = mapSize / 2;
        cross.moveTo(cx - 8, cy).lineTo(cx + 8, cy);
        cross.moveTo(cx, cy - 8).lineTo(cx, cy + 8);
        cross.stroke({ width: 1, color: C.cross, alpha: 0.7 });
        this.root.addChild(cross);

        // label
        const label = new Text({
            text: "RADAR",
            style: new TextStyle({
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 10,
                fontWeight: "bold",
                fill: C.label,
                letterSpacing: 2,
            }),
        });
        label.x = 10;
        label.y = 6;
        label.alpha = 0.85;
        this.root.addChild(label);

        // masque pour clipper les points
        const mask = new Graphics()
            .roundRect(5, 5, mapSize - 10, mapSize - 10, 4)
            .fill(0xffffff);
        this.root.addChild(mask);
        this.dotsLayer.mask = mask;
        this.root.addChild(this.dotsLayer);

        this.dotsLayer.addChild(this.othersGfx);
        this.drawLocalDot();
        this.dotsLayer.addChild(this.localDot);

        // légende bas
        const legYou = new Graphics().circle(12, mapSize - 10, 3).fill(C.you);
        const legOther = new Graphics().circle(52, mapSize - 10, 3).fill(C.other);
        const legText = new Text({
            text: "toi",
            style: { fontFamily: "Segoe UI, Tahoma, sans-serif", fontSize: 9, fill: C.label },
        });
        legText.x = 18;
        legText.y = mapSize - 16;
        const legText2 = new Text({
            text: "ennemis",
            style: { fontFamily: "Segoe UI, Tahoma, sans-serif", fontSize: 9, fill: C.label },
        });
        legText2.x = 58;
        legText2.y = mapSize - 16;
        this.root.addChild(legYou, legOther, legText, legText2);

        uiContainer.addChild(this.root);
    }

    private drawLocalDot() {
        this.localDot.clear();
        // anneau soft
        this.localDot.circle(0, 0, 7).stroke({ width: 1.5, color: C.youRing, alpha: 0.45 });
        this.localDot.circle(0, 0, 4).fill({ color: C.you, alpha: 1 });
        this.localDot.circle(0, 0, 1.5).fill({ color: 0xffffff, alpha: 0.9 });
    }

    update(playerX: number, playerY: number, players: { id: string; x: number; y: number }[]) {
        const centerX = this.mapSize / 2;
        const centerY = this.mapSize / 2;

        this.localDot.x = centerX;
        this.localDot.y = centerY;

        this.othersGfx.clear();
        for (const p of players) {
            // skip si superposé au local (même id possible selon source) - on ignore le centre
            const dx = (p.x - playerX) * this.scale;
            const dy = (p.y - playerY) * this.scale;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;

            const x = centerX + dx;
            const y = centerY + dy;
            this.othersGfx.circle(x, y, 3.5).fill({ color: C.other, alpha: 0.95 });
            this.othersGfx.circle(x, y, 3.5).stroke({ width: 1, color: C.otherEdge, alpha: 0.5 });
        }
    }
}
