import { Container, Text } from "pixi.js";
import type PlayerInfo from "../../../../shared/messages/PlayerInfo";

export class ScoreBoard {
    private scoreBoardContainer: Container;
    private players: Map<string, PlayerInfo> = new Map();

    constructor(uiContainer: Container) {
        this.scoreBoardContainer = new Container({ label: "ScoreBoard" });
        this.scoreBoardContainer.y += 200;
        uiContainer.addChild(this.scoreBoardContainer);
    }

    update(player: PlayerInfo): void {
        // Met à jour ou ajoute le joueur
        this.players.set(player.id, player);
        
        // Efface l'ancien affichage
        this.scoreBoardContainer.removeChildren().forEach(c => c.destroy());

        // Titre
        const title = new Text({
            text: "ScoreBoard",
            style: { fill: 0xffffff, fontSize: 20, fontWeight: "bold" },
        });
        this.scoreBoardContainer.addChild(title);

        // Trie les joueurs par kills (descendant)
        const sortedPlayers = [...this.players.values()].sort(
            (a, b) => b.killCounter - a.killCounter
        );

        // Affiche les joueurs
        let y = 30;
        for (const p of sortedPlayers) {
            const playerText = new Text({
                text: `${p.name} - Kills: ${p.killCounter}`,
                style: { fill: 0xffffff, fontSize: 16 },
            });
            playerText.y = y;
            y += 20;

            this.scoreBoardContainer.addChild(playerText);
        }
    }
}
