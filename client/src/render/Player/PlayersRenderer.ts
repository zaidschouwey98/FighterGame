import { Container, Spritesheet } from "pixi.js";
import PlayerSprite from "./PlayerSprite";
import type PlayerInfo from "../../../../shared/PlayerInfo";

export default class PlayersRenderer {
    private playerContainers: Map<string, Container>;
    private spriteSheets: Spritesheet[];
    private playerSprites: Map<string, PlayerSprite>;
    private players: Map<string, PlayerInfo>;
    private playerContainer: Container;
    private staticEffectContainer: Container;
    constructor(playerContainer: Container, spriteSheets: Spritesheet[], private _terrainContainer: Container, staticEffectContainer: Container) {
        this.spriteSheets = spriteSheets;
        this.staticEffectContainer = staticEffectContainer
        this.playerContainers = new Map();
        this.playerSprites = new Map();
        this.players = new Map();
        this.playerContainer = playerContainer;
    }

    public addNewPlayer(player: PlayerInfo) {
        const newPlayerContainer = new Container();
        newPlayerContainer.label = player.id;
        // créer le sprite lié à ce player
        const sprite = new PlayerSprite(player.id, newPlayerContainer, this.spriteSheets, this._terrainContainer, this.staticEffectContainer, player.name || "unknown-client-side");
        this.playerContainers.set(player.id, newPlayerContainer);
        this.playerSprites.set(player.id, sprite);
        this.players.set(player.id, player);

        this.playerContainer.addChild(newPlayerContainer);
    }

    public removePlayer(playerId: string) {
        const container = this.playerContainers.get(playerId);
        const sprite = this.playerSprites.get(playerId);

        if (sprite) {
            sprite.destroy();
        }

        if (container) {
            container.destroy({ children: true });
            this.playerContainer.removeChild(container);
        }

        this.playerContainers.delete(playerId);
        this.playerSprites.delete(playerId);
        this.players.delete(playerId);
    }

    public updatePlayers(players: PlayerInfo[]) {
        for (const player of players) {
            let playerContainer = this.playerContainers.get(player.id);
            let playerSprite = this.playerSprites.get(player.id);

            // Si le joueur n'existe pas encore, créez-le
            if (!playerContainer || !playerSprite) {
                this.addNewPlayer(player);
                playerContainer = this.playerContainers.get(player.id);
                playerSprite = this.playerSprites.get(player.id);
            }

            if (!playerContainer || !playerSprite) continue;

            // Mise à jour de la position
            playerContainer.x = player.position.x;
            playerContainer.y = player.position.y;
            if (playerSprite) playerSprite.update(player);
        }
    }
}
