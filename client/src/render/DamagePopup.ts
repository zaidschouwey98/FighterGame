import { Text, TextStyle, Container, Ticker } from "pixi.js";

export class DamagePopup extends Text {
    private lifetime = 1000; // durée en ms
    private elapsed = 0;
    private startY: number;

    constructor(dmg: number, isCrit: boolean) {
        const style = new TextStyle({
            fontFamily: "Arial",
            fontSize: isCrit ? 22 : 12,
            fill: isCrit ? "#ff2b2b" : "#ffffff",
            stroke: {
                color: '#000000ff',
                width: 5
            },

            fontWeight: isCrit ? "bold" : "normal",
            fontStyle: "italic"

        });

        super({
            text: dmg.toString(),
            style,
            resolution: 5
        });

        this.anchor.set(0.5);
        this.startY = 0;
    }

    showAt(x: number, y: number, container: Container) {
        this.x = x;
        this.y = y;
        this.startY = y;
        container.addChild(this);

        // départ petit
        this.scale.set(0.5);

        const ticker = Ticker.shared;
        const onTick = () => {
            this.elapsed += ticker.deltaMS;
            const t = this.elapsed / this.lifetime;

            this.y = this.startY - t * 20;
            
            // Fade out
            this.alpha = 1 - t;

            if (t < 0.3) {
                const progress = t / 0.3;
                const overshoot = 1.2;
                const scale = 0.5 + (overshoot - 0.5) * Math.sin(progress * Math.PI);
                this.scale.set(scale);
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
