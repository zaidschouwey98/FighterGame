import { Container } from "pixi.js";
import PlayerRenderer from "./render/PlayerRenderer";
import type Player from "./Player";
import { EventBus } from "./core/Eventbus";
import { GameState } from "./core/GameState";
import { NetworkClient } from "./network/NetworkClient";

export class GameController {
    private gameState: GameState;
    private renderer: PlayerRenderer;
    private network: NetworkClient;
    private eventBus: EventBus;

    constructor(parentContainer: Container, serverUrl: string) {
        this.eventBus = new EventBus();
        this.gameState = new GameState();
        this.renderer = new PlayerRenderer(parentContainer);
        this.network = new NetworkClient(serverUrl, this.eventBus);

        this.setupEventListeners();
    }

    private setupEventListeners() {
        // quand le serveur envoie la liste des joueurs
        this.eventBus.on("players:update", (players: Player[]) => {
            // Met à jour le GameState
            this.gameState.updatePlayers(players as unknown as Player[]);
            // Synchronise le rendu
            this.renderer.updatePlayers(players as unknown as Player[]);
        });

        // quand un joueur bouge
        this.eventBus.on("player:moved", (player: Player) => {
            this.gameState.updatePlayer(player as unknown as Player);
            this.renderer.updatePlayers([player as unknown as Player]);
        });

        // ici tu peux ajouter d'autres events comme "player:attacked"
    }

    // Exemples de méthodes pour le controller
    public movePlayer(playerId: string, x: number, y: number) {
        const player = this.gameState.players.get(playerId);
        if (!player) return;
        player.position.x = x;
        player.position.y = y;

        this.network.move({ x, y });
        this.renderer.updatePlayers([player]);
    }

    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }
}
