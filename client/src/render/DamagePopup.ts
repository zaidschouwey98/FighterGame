import { Text, TextStyle, Container, Ticker } from "pixi.js";

export class DamagePopup extends Text {
    private lifetime = 1000; // durée en ms
    private elapsed = 0;
    private startY: number;

    private driftX: number;
    private isCrit: boolean;

    constructor(dmg: number, isCrit: boolean) {
        const style = new TextStyle({
            fontFamily: "Arial",
            fontSize: isCrit ? 26 : 14,
            fill: isCrit ? "#ff2b2b" : "#ffffff",
            stroke: {
                color: '#000000ff',
                width: 5
            },

            fontWeight: isCrit ? "bold" : "normal",
            fontStyle: "italic"

        });

        super({
            text: isCrit ? `${dmg}!` : dmg.toString(),
            style,
            resolution: 5
        });

        this.anchor.set(0.5);
        this.startY = 0;
        this.isCrit = isCrit;
        this.driftX = (Math.random() - 0.5) * 18;
    }

    showAt(x: number, y: number, container: Container) {
        this.x = x;
        this.y = y;
        this.startY = y;
        container.addChild(this);

        // départ petit → overshoot (plus fort en crit)
        this.scale.set(0.35);

        const ticker = Ticker.shared;
        const onTick = () => {
            this.elapsed += ticker.deltaMS;
            const t = this.elapsed / this.lifetime;

            this.y = this.startY - t * (this.isCrit ? 32 : 22);
            this.x = x + this.driftX * t;

            // Fade out (reste lisible un peu plus longtemps)
            this.alpha = t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45;

            if (t < 0.22) {
                const progress = t / 0.22;
                const overshoot = this.isCrit ? 1.55 : 1.25;
                const scale = 0.35 + (overshoot - 0.35) * Math.sin(progress * Math.PI);
                this.scale.set(scale);
            } else if (t < 0.5) {
                this.scale.set(this.isCrit ? 1.05 : 1);
            }

            if (this.elapsed >= this.lifetime) {
                ticker.remove(onTick);
                container.removeChild(this);
                this.destroy();
            }
        };

        ticker.add(onTick);
    }

}
