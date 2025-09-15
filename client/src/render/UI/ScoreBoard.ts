import { Container, Text } from "pixi.js";
import { GameState } from "../../core/GameState";
import { Observer } from "../../core/observer/Observer";
import type PlayerInfo from "../../../../shared/PlayerInfo";

export class ScoreBoard extends Observer {

    private scoreBoardContainer: Container;

    constructor(uiContainer: Container) {
        super();
        this.scoreBoardContainer = new Container({ label: "ScoreBoard" });
        this.scoreBoardContainer.y += 200;
        uiContainer.addChild(this.scoreBoardContainer);
        GameState.instance.addObserver(this);
    }

    onNotify(players: PlayerInfo[]): void {
        // On efface l'ancien affichage
        this.scoreBoardContainer.removeChildren();

        // Titre
        const title = new Text({
            text: "ScoreBoard",
            style: { fill: 0xffffff, fontSize: 20, fontWeight: "bold" },
        });
        title.x = 0;
        title.y = 0;
        this.scoreBoardContainer.addChild(title);

        let y = 30; // Position Y de départ

        for (const player of players) {
            const playerText = new Text({
                text: `${player.name} - Kills: ${player.killCounter}`,
                style: { fill: 0xffffff, fontSize: 16 },
            });
            playerText.x = 0;
            playerText.y = y;
            y += 20; // Décalage entre lignes

            this.scoreBoardContainer.addChild(playerText);
        }
    }
}