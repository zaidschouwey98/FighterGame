import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class PlayerPlate {
    private container: Container;
    private hpwidth: number;
    private hpheight: number;
    private xpheight: number;
    private skew: number = 3; // décalage horizontal (en px) entre top et bottom

    // HP
    private hpBgContainer: Container;
    private hpBgRect: Graphics;
    private hpFillContainer: Container;
    private hpFillRect: Graphics;
    private hpFrame: Graphics;
    private hpTicks: Graphics;

    // XP
    private xpOffsetY: number;
    private xpBgContainer: Container;
    private xpBgRect: Graphics;
    private xpFillContainer: Container;
    private xpFillRect: Graphics;
    private xpFrame: Graphics;
    private xpTicks: Graphics;

    // Level + name
    private lvlFrame: Graphics;
    private lvlText: Text;
    private nameText: Text;

    private maxHp = 100;
    private hp = 100;
    private maxXp = 100;
    private xp = 0;
    private hpFrameColor = 0x000000;
    private xpFrameColor = 0x000000;

    constructor(
        parent: Container,
        playerName: string,
        offsetY: number = -30,
        width = 40,
        height = 10
    ) {
        this.container = new Container();
        this.container.zIndex = 10;
        this.container.y = offsetY;
        this.container.x = -width / 2;
        parent.addChild(this.container);

        this.hpwidth = width;
        this.hpheight = height - height / 4;
        this.xpheight = this.hpheight / 2;
        this.xpOffsetY = this.hpheight + 2;

        // ===== LEVEL & NAME =====
        this.lvlFrame = new Graphics()
            .rect(0, 0, 14, height - height / 4 + this.hpheight / 2)
            .stroke({ width: 2, color: this.hpFrameColor })
            .fill({ color: 0x444444 });
        this.lvlFrame.x = width;

        const lvlStyle = new TextStyle({ fontFamily: "Arial", fontSize: 8, fill: "#ffffff", stroke: "#000000" });
        this.lvlText = new Text({ style: lvlStyle });
        this.lvlText.x = 7;
        this.lvlText.y = (height - height / 4 + this.hpheight / 2) / 2;
        this.lvlText.anchor.set(0.3, 0.5);
        this.lvlText.resolution = 5;
        this.lvlText.text = "1";
        this.lvlFrame.addChild(this.lvlText);
        this.container.addChild(this.lvlFrame);

        // ===== HP BAR =====
        // Angle de cisaillement (skew) en radians: tan(angle) = -skew / hpheight
        const hpShear = Math.atan(-this.skew / this.hpheight);

        // HP background (gris)
        this.hpBgRect = new Graphics().rect(0, 0, this.hpwidth, this.hpheight).fill({ color: 0x444444 });
        this.hpBgContainer = new Container();
        this.hpBgContainer.addChild(this.hpBgRect);
        this.hpBgContainer.skew.x = hpShear;
        // translation: on pousse de +skew pour que le top-left visuel = skew, bottom-left = 0
        this.hpBgContainer.x = this.skew;
        this.container.addChild(this.hpBgContainer);

        // HP fill (vert)
        this.hpFillRect = new Graphics().rect(0, 0, this.hpwidth, this.hpheight).fill({ color: 0x00ff00 });
        this.hpFillContainer = new Container();
        this.hpFillContainer.addChild(this.hpFillRect);
        this.hpFillContainer.skew.x = hpShear;
        this.hpFillContainer.x = this.skew;
        this.container.addChild(this.hpFillContainer);

        // HP frame (parallélogramme)
        this.hpFrame = new Graphics().poly([
            this.skew, 0,
            this.hpwidth + this.skew, 0,
            this.hpwidth, this.hpheight,
            0, this.hpheight
        ]).stroke({ width: 2, color: this.hpFrameColor });
        this.container.addChild(this.hpFrame);

        // HP ticks (statique pour un max donné)
        this.hpTicks = new Graphics();
        this.container.addChild(this.hpTicks);
        this.buildHpTicks(); // uses this.maxHp

        // ===== XP BAR (inversée) =====
        // Ici on veut bottom décalé à DROITE de +skew par rapport au top
        // tan(angle) = +skew / xpheight
        const xpShear = Math.atan(this.skew / this.xpheight);

        // XP background
        this.xpBgRect = new Graphics().rect(0, 0, this.hpwidth, this.xpheight).fill({ color: 0x222222 });
        this.xpBgContainer = new Container();
        this.xpBgContainer.addChild(this.xpBgRect);
        this.xpBgContainer.skew.x = xpShear;
        this.xpBgContainer.y = this.xpOffsetY;
        this.container.addChild(this.xpBgContainer);

        // XP fill (violet)
        this.xpFillRect = new Graphics().rect(0, 0, this.hpwidth, this.xpheight).fill({ color: 0x8000ff });
        this.xpFillContainer = new Container();
        this.xpFillContainer.addChild(this.xpFillRect);
        this.xpFillContainer.skew.x = xpShear;
        this.xpFillContainer.y = this.xpOffsetY;
        this.container.addChild(this.xpFillContainer);

        // XP frame
        this.xpFrame = new Graphics().poly([
            0, this.xpOffsetY,
            this.hpwidth, this.xpOffsetY,
            this.hpwidth + this.skew, this.xpOffsetY + this.xpheight,
            this.skew, this.xpOffsetY + this.xpheight
        ]).stroke({ width: 2, color: this.xpFrameColor });
        this.container.addChild(this.xpFrame);

        // XP ticks
        this.xpTicks = new Graphics();
        this.container.addChild(this.xpTicks);
        this.buildXpTicks(); // uses this.maxXp



        const nameStyle = new TextStyle({ fontFamily: "Arial", fontStyle: "italic", fontSize: 8, fill: "#ffffff", stroke: "#000000" });
        this.nameText = new Text({ text: playerName, style: nameStyle, resolution: 5 });
        this.nameText.x = 3;
        this.nameText.y = -10;
        this.container.addChild(this.nameText);

        // init ratios
        this.applyRatios();
    }

    /** Construit les ticks HP (appelé au ctor et quand maxHp change) */
    private buildHpTicks(step = 30) {
        this.hpTicks.clear();

        const divisions = Math.floor(this.maxHp / step);
        const topLeft = { x: this.skew, y: 0 };
        const topRight = { x: this.hpwidth + this.skew, y: 0 };
        const botLeft = { x: 0, y: this.hpheight };
        const botRight = { x: this.hpwidth, y: this.hpheight };

        for (let i = 1; i < divisions; i++) {
            const r = i / divisions;
            const topX = topLeft.x + (topRight.x - topLeft.x) * r;
            const topY = topLeft.y + (topRight.y - topLeft.y) * r;
            const botX = botLeft.x + (botRight.x - botLeft.x) * r;
            const botY = botLeft.y + (botRight.y - botLeft.y) * r;

            this.hpTicks.moveTo(topX, topY);
            this.hpTicks.lineTo(botX, botY);
        }
        this.hpTicks.stroke({ width: 1, color: this.hpFrameColor });
    }

    /** Construit les ticks XP (appelé au ctor et quand maxXp change) */
    private buildXpTicks(step = 10) {
        this.xpTicks.clear();

        const divisions = Math.floor(this.maxXp / step);
        const topLeft = { x: 0, y: this.xpOffsetY };
        const topRight = { x: this.hpwidth, y: this.xpOffsetY };
        const botLeft = { x: this.skew, y: this.xpOffsetY + this.xpheight };
        const botRight = { x: this.hpwidth + this.skew, y: this.xpOffsetY + this.xpheight };

        for (let i = 1; i < divisions; i++) {
            const r = i / divisions;
            const topX = topLeft.x + (topRight.x - topLeft.x) * r;
            const topY = topLeft.y + (topRight.y - topLeft.y) * r;
            const botX = botLeft.x + (botRight.x - botLeft.x) * r;
            const botY = botLeft.y + (botRight.y - botLeft.y) * r;

            this.xpTicks.moveTo(topX, topY);
            this.xpTicks.lineTo(botX, botY);
        }
        this.xpTicks.stroke({ width: 1, color: this.xpFrameColor });
    }

    /** Applique les ratios en ne scalant QUE les rectangles, pas les conteneurs cisaillés */
    private applyRatios() {
        const hpRatio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
        const xpRatio = this.maxXp > 0 ? this.xp / this.maxXp : 0;

        // clamp
        const hr = Math.max(0, Math.min(1, hpRatio));
        const xr = Math.max(0, Math.min(1, xpRatio));

        // Important: scale le RECTANGLE enfant, pas le container (pour ne pas toucher au skew)
        this.hpFillRect.scale.x = hr;
        this.xpFillRect.scale.x = xr;
    }

    public update(hp: number, maxHp: number, xp: number, maxXp: number, level: number) {
        // clamp et assign
        this.hp = Math.max(0, Math.min(maxHp, hp));
        this.xp = Math.max(0, Math.min(maxXp, xp));

        // HP : ticks reconstruits si max change
        if (maxHp !== this.maxHp) {
            this.maxHp = maxHp;
            this.buildHpTicks();
        } else {
            this.maxHp = maxHp;
        }

        // XP : toujours les mêmes ticks, donc pas de rebuild
        this.maxXp = maxXp;

        // Met à jour les barres
        this.applyRatios();

        // Texte
        this.lvlText.text = String(level);
    }


    public destroy() {
        this.container.destroy({ children: true });
    }
}
