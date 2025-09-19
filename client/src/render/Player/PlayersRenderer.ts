import { Container, Spritesheet } from "pixi.js";
import PlayerSprite from "./PlayerSprite";
import type PlayerInfo from "../../../../shared/PlayerInfo";
import { WeaponFactory } from "./weapon/WeaponFactory";

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
        const sprite = new PlayerSprite(player.id, newPlayerContainer, this.spriteSheets, this._terrainContainer, this.staticEffectContainer, player.name || "unknown-client-side", new WeaponFactory(player.weapon!));
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

    public syncPosition(players: PlayerInfo[]){
        for (const player of players) {
            let playerContainer = this.playerContainers.get(player.id);
            if (!playerContainer) continue;
            playerContainer.x = player.position.x;
            playerContainer.y = player.position.y;
        }
    }

    public syncPlayers(players: PlayerInfo[]) {
        for (const player of players) {
            let playerSprite = this.playerSprites.get(player.id);
            if (!playerSprite) continue;
            // Mise à jour de la position
            this.syncPosition([player]);
            playerSprite.syncPlayer(player);
        }
    }

    public update(delta: number) {
        for (const sprite of this.playerSprites.values()) {
            sprite.update(delta);
        }
    }
}
