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
            resolution:5
        });

        this.anchor.set(0.5);
        this.startY = 0;
    }

    showAt(x: number, y: number, container: Container) {
        this.x = x;
        this.y = y;
        this.startY = y;
        container.addChild(this);

        const ticker = Ticker.shared;
        const onTick = () => {
            this.elapsed += ticker.deltaMS;

            // animation simple
            this.y = this.startY - (this.elapsed / this.lifetime) * 40; // monte
            this.alpha = 1 - this.elapsed / this.lifetime; // fade out

            if (this.elapsed >= this.lifetime) {
                ticker.remove(onTick);
                container.removeChild(this);
                this.destroy();
            }
        };

        ticker.add(onTick);
    }
}
