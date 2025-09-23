import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class PlayerPlate {
    private container: Container;
    private hpwidth: number;
    private hpheight: number;
    private xpheight: number;
    private skew: number = 3;

    private background: Graphics;
    private health: Graphics;
    private frame: Graphics;
    private ticks: Graphics;

    private xpBackground: Graphics;
    private xpFill: Graphics;
    private xpFrame: Graphics;
    private xpTicks: Graphics;

    private maxHp: number = 100;
    private hp: number = 100;
    private hpFrameColor: number = 0x000000;

    private maxXp: number = 100;
    private xp: number = 0;
    private xpFrameColor: number = 0x000000;

    constructor(
        parent: Container,
        playerName: string,
        level: number,
        offsetY: number = -30,
        width = 40,
        height = 10
    ) {
        this.container = new Container();
        this.container.y = offsetY;
        this.container.x = -width / 2;
        parent.addChild(this.container);

        this.hpwidth = width;
        this.hpheight = height - height / 4;
        this.xpheight = this.hpheight / 2; // XP bar moins haute

        // HP graphics
        this.background = new Graphics();
        this.health = new Graphics();
        this.ticks = new Graphics();
        this.frame = new Graphics();

        // XP graphics
        this.xpBackground = new Graphics();
        this.xpFill = new Graphics();
        this.xpTicks = new Graphics();
        this.xpFrame = new Graphics();

        this.container.addChild(
            this.background,
            this.health,
            this.ticks,
            this.frame,
            this.xpBackground,
            this.xpFill,
            this.xpTicks,
            this.xpFrame
        );

        this.redraw();
    }

    private drawParallelogram(g: Graphics, width: number, height: number, color: number, offsetY: number) {
        g.moveTo(this.skew, offsetY);
        g.lineTo(width + this.skew, offsetY);
        g.lineTo(width, offsetY + height);
        g.lineTo(0, offsetY + height);
        g.closePath();
        g.fill({ color });
    }

    private redraw() {
        this.background.clear();
        this.health.clear();
        this.frame.clear();
        this.ticks.clear();

        this.xpBackground.clear();
        this.xpFill.clear();
        this.xpFrame.clear();
        this.xpTicks.clear();

        // --- HP BAR ---
        const hpRatio = this.hp / this.maxHp;
        this.drawParallelogram(this.background, this.hpwidth, this.hpheight, 0x444444, 0);
        this.drawParallelogram(this.health, this.hpwidth * hpRatio, this.hpheight, 0x00ff00, 0);

        // Cadre HP
        this.frame.poly([
            this.skew, 0,
            this.hpwidth + this.skew, 0,
            this.hpwidth, this.hpheight,
            0, this.hpheight
        ]);
        this.frame.stroke({ width: 2, color: this.hpFrameColor });

        // Ticks HP
        const hpStep = 30;
        const hpDivisions = Math.floor(this.maxHp / hpStep);
        const hpTopLeft = { x: this.skew, y: 0 };
        const hpTopRight = { x: this.hpwidth + this.skew, y: 0 };
        const hpBotLeft = { x: 0, y: this.hpheight };
        const hpBotRight = { x: this.hpwidth, y: this.hpheight };

        for (let i = 1; i < hpDivisions; i++) {
            const r = i / hpDivisions;
            const topX = hpTopLeft.x + (hpTopRight.x - hpTopLeft.x) * r;
            const topY = hpTopLeft.y + (hpTopRight.y - hpTopLeft.y) * r;
            const botX = hpBotLeft.x + (hpBotRight.x - hpBotLeft.x) * r;
            const botY = hpBotLeft.y + (hpBotRight.y - hpBotLeft.y) * r;

            this.ticks.moveTo(topX, topY);
            this.ticks.lineTo(botX, botY);
        }
        this.ticks.stroke({ width: 1, color: this.hpFrameColor });

        // --- XP BAR (juste sous la barre de vie) ---
        const offsetY = this.hpheight + 2; // petit espace
        const xpRatio = this.xp / this.maxXp;
        this.drawParallelogram(this.xpBackground, this.hpwidth, this.xpheight, 0x222222, offsetY);
        this.drawParallelogram(this.xpFill, this.hpwidth * xpRatio, this.xpheight, 0x8000ff, offsetY);

        // Cadre XP
        this.xpFrame.poly([
            this.skew, offsetY,
            this.hpwidth + this.skew, offsetY,
            this.hpwidth, offsetY + this.xpheight,
            0, offsetY + this.xpheight
        ]);
        this.xpFrame.stroke({ width: 2, color: this.xpFrameColor });

        // Ticks XP
        const xpStep = 10; // graduation tous les 10 xp
        const xpDivisions = Math.floor(this.maxXp / xpStep);
        const xpTopLeft = { x: this.skew, y: offsetY };
        const xpTopRight = { x: this.hpwidth + this.skew, y: offsetY };
        const xpBotLeft = { x: 0, y: offsetY + this.xpheight };
        const xpBotRight = { x: this.hpwidth, y: offsetY + this.xpheight };

        for (let i = 1; i < xpDivisions; i++) {
            const r = i / xpDivisions;
            const topX = xpTopLeft.x + (xpTopRight.x - xpTopLeft.x) * r;
            const topY = xpTopLeft.y + (xpTopRight.y - xpTopLeft.y) * r;
            const botX = xpBotLeft.x + (xpBotRight.x - xpBotLeft.x) * r;
            const botY = xpBotLeft.y + (xpBotRight.y - xpBotLeft.y) * r;

            this.xpTicks.moveTo(topX, topY);
            this.xpTicks.lineTo(botX, botY);
        }
        this.xpTicks.stroke({ width: 1, color: this.xpFrameColor });
    }

    public update(hp: number, maxHp: number, xp: number, maxXp: number, level: number) {
        this.hp = Math.max(0, Math.min(maxHp, hp));
        this.maxHp = maxHp;
    
        this.xp = Math.max(0, Math.min(maxXp, xp));
        this.xp = 36;
        this.maxXp = maxXp;

        this.redraw();
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
