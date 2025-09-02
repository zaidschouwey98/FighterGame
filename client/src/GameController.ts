import { Container } from "pixi.js";
import { Action } from "../../shared/Action";
import Player from "../../shared/Player";
import { EventBus } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { NetworkClient } from "./network/NetworkClient";
import PlayerRenderer from "./render/PlayerRenderer";


export class GameController {
    private gameState: GameState;
    private renderer: PlayerRenderer;
    private network: NetworkClient;
    private eventBus: EventBus;
    private localPlayerId: string | null = null;
    private keysPressed: Set<string> = new Set();

    constructor(parentContainer: Container, serverUrl: string) {
        this.eventBus = new EventBus();
        this.gameState = new GameState();
        this.renderer = new PlayerRenderer(parentContainer);
        this.network = new NetworkClient(serverUrl, this.eventBus);
    
        this.setupEventListeners();
        this.setupInputHandlers();
    }

    private setupEventListeners() {
        // Quand on se connecte au serveur
        this.eventBus.on("connected", (playerId: string) => {
            console.log("Connecté avec ID:", playerId);
            this.localPlayerId = playerId;
        });

        // Quand le serveur envoie la liste des joueurs
        this.eventBus.on("players:update", (players: Player[]) => {
            this.gameState.updatePlayers(players);
            this.renderer.updatePlayers(players);
        });

        // Quand un joueur rejoint
        this.eventBus.on("player:joined", (player: Player) => {
            this.gameState.updatePlayer(player);
            this.renderer.updatePlayers([player]);
        });

        // Quand un joueur quitte
        this.eventBus.on("player:left", (playerId: string) => {
            this.gameState.removePlayer(playerId);
            this.renderer.removePlayer(playerId);
        });

        // quand un joueur bouge
        this.eventBus.on("player:moved", (player: Player) => {
            // this.gameState.updatePlayer(player);
            // this.renderer.updatePlayers([player]);
        });
        
    }

    private setupInputHandlers() {
        window.addEventListener("keydown", (e) => {
            this.keysPressed.add(e.key.toLowerCase());
        });

        window.addEventListener("keyup", (e) => {
            this.keysPressed.delete(e.key.toLowerCase());
        });
    }

   

    public update(delta: number) {
        if (!this.localPlayerId) return;

        const player = this.gameState.players.get(this.localPlayerId);
        if (!player) return;

        this.handleMovement(player, delta);
        this.gameState.players.set(this.localPlayerId,player)
        this.renderer.updatePlayers([player]);
    }


    private handleMovement(player: Player, delta: number) {
        let dx = 0;
        let dy = 0;
        
        if (this.keysPressed.has("w")) dy -= 1;
        if (this.keysPressed.has("s")) dy += 1;
        if (this.keysPressed.has("a")) dx -= 1;
        if (this.keysPressed.has("d")) dx += 1;
        
        let actionChanged = false;
        let newAction = player.currentAction;

        // Si déplacement
        if (dx !== 0 || dy !== 0) {
            // Normalisation (évite vitesse diagonale trop rapide)
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            // Mise à jour de la position
            player.position.x += dx * player.speed * 16 * delta / 60;
            player.position.y += dy * player.speed * 16*  delta / 60;
            this.network.move({x:player.position.x,y:player.position.y})
            // Choisir l'action en fonction de la direction
            if (dx > 0) newAction = Action.MOVE_RIGHT;
            else if (dx < 0) newAction = Action.MOVE_LEFT;
            else if (dy > 0) newAction = Action.MOVE_DOWN;
            else if (dy < 0) newAction = Action.MOVE_TOP;

            actionChanged = player.currentAction !== newAction;
            player.currentAction = newAction;

            // Envoyer la nouvelle position au serveur
            // this.network.move({ 
            //     x: player.position.x, 
            //     y: player.position.y,
            //     action: player.currentAction
            // });

        } else {
            switch (player.currentAction) {
                case Action.MOVE_RIGHT:
                case Action.IDLE_RIGHT:
                    newAction = Action.IDLE_RIGHT;
                    break;
                case Action.MOVE_LEFT:
                case Action.IDLE_LEFT:
                    newAction = Action.IDLE_LEFT;
                    break;
                case Action.MOVE_TOP:
                case Action.IDLE_TOP:
                    newAction = Action.IDLE_TOP;
                    break;
                default:
                    newAction = Action.IDLE_DOWN;
            }

            actionChanged = player.currentAction !== newAction;
            player.currentAction = newAction;
        }

    }
    private getActionFromMovement(x: number, y: number): Action {
        // Logique simple pour déterminer l'action basée sur le mouvement
        // Vous pouvez améliorer cela selon vos besoins
        return Action.IDLE_DOWN; // Temporaire
    }

    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    public getLocalPlayerId(): string | null {
        return this.localPlayerId;
    }
}