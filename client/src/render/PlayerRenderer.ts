import { Container, Spritesheet } from "pixi.js";
import type Player from "../../../shared/Player";
import PlayerSprite from "./PlayerSprite";
import type { AttackData } from "../../../shared/AttackData";

export default class PlayerRenderer {
    
    private playerContainers: Map<string, Container>;
    private spriteSheets:Spritesheet[];
    private playerSprites: Map<string, PlayerSprite>;
    private players: Map<string, Player>;
    private globalContainer: Container;
    constructor(globalContainer: Container, spriteSheets:Spritesheet[]) {
        this.spriteSheets = spriteSheets;
        this.playerContainers = new Map();
        this.playerSprites = new Map();
        this.players = new Map();
        this.globalContainer = globalContainer;
    }

    public addNewPlayer(player: Player) {
        const newPlayerContainer = new Container();
        newPlayerContainer.label = player.id;
        
        // créer le sprite lié à ce player
        const sprite = new PlayerSprite(player.id, newPlayerContainer,this.spriteSheets,this.globalContainer);
        this.playerContainers.set(player.id, newPlayerContainer);
        this.playerSprites.set(player.id, sprite);
        this.players.set(player.id, player);

        this.globalContainer.addChild(newPlayerContainer);
    }

    public removePlayer(playerId: string) {
        const container = this.playerContainers.get(playerId);
        const sprite = this.playerSprites.get(playerId);

        if (sprite) {
            sprite.destroy();
        }

        if (container) {
            container.destroy({ children: true });
            this.globalContainer.removeChild(container);
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
            
            playerSprite.playAnimation(player.currentAction);
            

            this.players.set(player.id, player);
        }
    }
    
    overridePlayerAnimation(player: Player) {
        let playerSprite = this.playerSprites.get(player.id);
        playerSprite?.overrideCurrentAnimation(player.currentAction,player);
    }

    public showAttackEffect(attackData:AttackData): void {
        let playerSprite = this.playerSprites.get(attackData.playerId);
        playerSprite?.playAttackAnimation(attackData.playerAction, attackData.rotation);
        
    }
}
