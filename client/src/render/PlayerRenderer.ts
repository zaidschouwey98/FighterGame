import { Container, Spritesheet } from "pixi.js";
import type Player from "../../../shared/Player";
import PlayerSprite from "./PlayerSprite";
import type { AttackData } from "../../../shared/AttackData";
import { Action } from "../../../shared/Action";

export default class PlayerRenderer {

    private playerContainers: Map<string, Container>;
    private spriteSheets: Spritesheet[];
    private playerSprites: Map<string, PlayerSprite>;
    private players: Map<string, Player>;
    private playerContainer: Container;
    private staticEffectContainer: Container;
    constructor(playerContainer: Container, spriteSheets: Spritesheet[], staticEffectContainer: Container) {
        this.spriteSheets = spriteSheets;
        this.staticEffectContainer = staticEffectContainer
        this.playerContainers = new Map();
        this.playerSprites = new Map();
        this.players = new Map();
        this.playerContainer = playerContainer;
    }

    public addNewPlayer(player: Player) {
        const newPlayerContainer = new Container();
        newPlayerContainer.label = player.id;

        // créer le sprite lié à ce player
        const sprite = new PlayerSprite(player.id, newPlayerContainer, this.spriteSheets, this.staticEffectContainer);
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

    public updatePlayers(players: Player[]) {
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
            // Mise à jour de l'animation
            switch (player.currentAction) {
                case Action.ATTACK_1:
                case Action.ATTACK_2:
                case Action.ATTACK_3:
                case Action.ATTACK_DASH_BOTTOM:
                case Action.ATTACK_DASH_TOP:
                case Action.ATTACK_DASH_RIGHT:
                case Action.ATTACK_DASH_LEFT:
                case Action.ATTACK_DASH_TOP_LEFT:
                case Action.ATTACK_DASH_TOP_RIGHT:
                case Action.ATTACK_DASH_BOTTOM_LEFT:
                case Action.ATTACK_DASH_BOTTOM_RIGHT:
                    break;
                default:
                    playerSprite.playRepeatableAnimation(player.currentAction);
                    break;
            }


            this.players.set(player.id, player);
        }
    }

    public overridePlayerAnimation(player: Player) {
        let playerSprite = this.playerSprites.get(player.id);
        playerSprite?.overrideCurrentAnimation(player.currentAction, player);
    }

    public showAttackEffect(attackData: AttackData): void {
        let playerSprite = this.playerSprites.get(attackData.playerId);
        playerSprite?.playAttackAnimation(attackData.playerAction, attackData.rotation);

    }
}
