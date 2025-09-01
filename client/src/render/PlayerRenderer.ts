import { Container } from "pixi.js";
import type Player from "../Player";
import PlayerSprite from "./PlayerSprite";

export default class PlayerRenderer {
    private playerContainers: Map<string, Container>;
    private playerSprites: Map<string, PlayerSprite>;
    private players: Map<string, Player>;
    private parentContainer: Container;

    constructor(parentContainer: Container) {
        this.playerContainers = new Map();
        this.playerSprites = new Map();
        this.players = new Map();
        this.parentContainer = parentContainer;
    }

    public addNewPlayer(player: Player) {
        const newPlayerContainer = new Container();
        newPlayerContainer.label = player.id;

        // créer le sprite lié à ce player
        const sprite = new PlayerSprite(player.id, newPlayerContainer);
        sprite.initialize();
        this.playerContainers.set(player.id, newPlayerContainer);
        this.playerSprites.set(player.id, sprite);
        this.players.set(player.id, player);

        this.parentContainer.addChild(newPlayerContainer);
    }

    public removeNewPlayer(player: Player) {
        const container = this.playerContainers.get(player.id);
        const sprite = this.playerSprites.get(player.id);

        sprite?.destroy();
        container?.destroy(true);

        this.playerContainers.delete(player.id);
        this.playerSprites.delete(player.id);
        this.players.delete(player.id);
    }

    public updatePlayers(players: Player[]) {
        for (const player of players) {
            const playerContainer = this.playerContainers.get(player.id);
            const playerSprite = this.playerSprites.get(player.id);

            if (!playerContainer || !playerSprite)
                throw new Error(`Missing container/sprite for player ${player.id}`);

            // 💡 maj position
            playerContainer.x = player.position.x;
            playerContainer.y = player.position.y;

            // 💡 maj animation si l’action a changé
            const lastState = this.players.get(player.id);
            if (!lastState || lastState.currentAction !== player.currentAction) {
                playerSprite.playAnimation(player.currentAction);
            }

            // on stocke l’état pour comparaison future
            this.players.set(player.id, player);
        }
    }
}
