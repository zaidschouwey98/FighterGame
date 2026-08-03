import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type PlayerInfo from "../../../../shared/messages/PlayerInfo";

const PANEL_W = 196;
const PAD = 10;

/** Palette HUD combat (pas de violet générique) */
const C = {
    bg: 0x0c1218,
    bgAlt: 0x141c24,
    border: 0xc4a35a,
    borderDim: 0x3d4a3c,
    title: 0xf0e6c8,
    muted: 0x7a8a8c,
    name: 0xe8eef0,
    kill: 0xe8b86d,
    rank1: 0xffd978,
    rank2: 0xc8d0d4,
    rank3: 0xc9a07a,
    accent: 0x3d8b7a,
};

export class ScoreBoard {
    private root = new Container({ label: "ScoreBoard" });
    private body = new Container();
    private players = new Map<string, PlayerInfo>();

    constructor(uiContainer: Container, belowMinimapY = 214) {
        this.root.y = belowMinimapY;
        this.root.addChild(this.body);
        uiContainer.addChild(this.root);
        this.redraw();
    }

    public setPlayers(players: PlayerInfo[]): void {
        this.players.clear();
        for (const p of players) this.players.set(p.id, p);
        this.redraw();
    }

    public update(player: PlayerInfo): void {
        const prev = this.players.get(player.id);
        this.players.set(player.id, player);
        if (
            prev &&
            prev.killCounter === player.killCounter &&
            prev.currentLvl === player.currentLvl &&
            prev.name === player.name
        ) {
            return;
        }
        this.redraw();
    }

    public remove(playerId: string): void {
        if (!this.players.delete(playerId)) return;
        this.redraw();
    }

    private redraw(): void {
        this.body.removeChildren().forEach((c) => c.destroy({ children: true }));

        const sorted = [...this.players.values()].sort(
            (a, b) => b.killCounter - a.killCounter || (b.currentLvl ?? 0) - (a.currentLvl ?? 0)
        );

        const rowH = 22;
        const headerH = 28;
        const contentH = sorted.length === 0 ? 28 : sorted.length * rowH + 6;
        const panelH = headerH + contentH + PAD;

        // fond panel
        const bg = new Graphics();
        bg.roundRect(0, 0, PANEL_W, panelH, 6)
            .fill({ color: C.bg, alpha: 0.88 })
            .stroke({ width: 1.5, color: C.border, alpha: 0.75 });
        // barre accent gauche
        bg.rect(0, 8, 3, panelH - 16).fill({ color: C.accent, alpha: 0.9 });
        this.body.addChild(bg);

        // header
        const headerBg = new Graphics();
        headerBg.roundRect(1, 1, PANEL_W - 2, headerH, 5)
            .fill({ color: C.bgAlt, alpha: 0.95 });
        this.body.addChild(headerBg);

        const titleStyle = new TextStyle({
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 13,
            fontWeight: "bold",
            fill: C.title,
            letterSpacing: 2,
        });
        const title = new Text({ text: "LEADERBOARD", style: titleStyle });
        title.x = PAD + 4;
        title.y = 7;
        this.body.addChild(title);

        if (sorted.length === 0) {
            const empty = new Text({
                text: "En attente de joueurs…",
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 11,
                    fill: C.muted,
                    fontStyle: "italic",
                },
            });
            empty.x = PAD + 4;
            empty.y = headerH + 8;
            this.body.addChild(empty);
            return;
        }

        let y = headerH + 4;
        sorted.forEach((p, i) => {
            const rank = i + 1;
            const stripe = new Graphics();
            if (i % 2 === 0) {
                stripe.rect(4, y, PANEL_W - 8, rowH).fill({ color: 0xffffff, alpha: 0.03 });
                this.body.addChild(stripe);
            }

            const rankColor =
                rank === 1 ? C.rank1 : rank === 2 ? C.rank2 : rank === 3 ? C.rank3 : C.muted;

            const rankText = new Text({
                text: `${rank}.`,
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 12,
                    fontWeight: "bold",
                    fill: rankColor,
                },
            });
            rankText.x = PAD + 2;
            rankText.y = y + 4;
            this.body.addChild(rankText);

            const name = (p.name ?? "???").slice(0, 12);
            const nameText = new Text({
                text: name,
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 12,
                    fill: rank === 1 ? C.rank1 : C.name,
                    fontWeight: rank === 1 ? "bold" : "normal",
                },
            });
            nameText.x = PAD + 22;
            nameText.y = y + 4;
            this.body.addChild(nameText);

            // badge kills
            const killsLabel = `${p.killCounter}`;
            const kills = new Text({
                text: killsLabel,
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 12,
                    fontWeight: "bold",
                    fill: C.kill,
                },
            });
            kills.anchor.set(1, 0);
            kills.x = PANEL_W - PAD - 28;
            kills.y = y + 4;
            this.body.addChild(kills);

            const kTag = new Text({
                text: "K",
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 9,
                    fill: C.muted,
                },
            });
            kTag.x = PANEL_W - PAD - 24;
            kTag.y = y + 6;
            this.body.addChild(kTag);

            const lvl = new Text({
                text: `L${p.currentLvl ?? 1}`,
                style: {
                    fontFamily: "Segoe UI, Tahoma, sans-serif",
                    fontSize: 10,
                    fill: C.accent,
                },
            });
            lvl.anchor.set(1, 0);
            lvl.x = PANEL_W - PAD;
            lvl.y = y + 5;
            this.body.addChild(lvl);

            y += rowH;
        });
    }
}
