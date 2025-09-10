import { Application, Container, Spritesheet } from "pixi.js";
import Player from "./core/player/Player";
import type { AttackResult } from "../../shared/AttackResult";
import { AttackService } from "./core/AttackService";
import { CoordinateService } from "./core/CoordinateService";
import { EventBus, EventBusMessage } from "./core/EventBus";
import { GameState } from "./core/GameState";
import { InputHandler } from "./core/InputHandler";
import { MovementService } from "./core/MovementService";
import { NetworkClient } from "./network/NetworkClient";
import { Renderer } from "./render/Renderer";
import { BlockService } from "./core/BlockService";
import type PlayerInfo from "../../shared/PlayerInfo";
import { CHUNK_SIZE, KNOCKBACK_TIMER, TILE_SIZE } from "./constantes";
import { TeleportService } from "./core/TeleportService";


export class GameController {
    private gameState: GameState;
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private renderer: Renderer;
    private localPlayerId: string | null = null;
    private currentChunkX?: number;
    private currentChunkY?: number;
    private localPlayer: Player | undefined;

    // Services
    private coordinateService: CoordinateService;
    private attackService: AttackService;
    private blockService: BlockService
    private teleportService: TeleportService;
    private movementService: MovementService;
    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {
        this.setupEventListeners();
        new NetworkClient(serverUrl, this.eventBus);
        this.gameState = GameState.instance;
        this.renderer = new Renderer(app, globalContainer, spriteSheets, this.eventBus);
        this.coordinateService = new CoordinateService(app, this.renderer.camera);

        this.movementService = new MovementService(this.inputHandler);
        this.attackService = new AttackService(this.inputHandler, this.coordinateService);
        this.blockService = new BlockService(this.inputHandler, this.coordinateService, this.eventBus);
        this.teleportService = new TeleportService(this.inputHandler, this.coordinateService, this.eventBus);

    }

    private setupEventListeners() {
        // Connexion
        this.eventBus.on(EventBusMessage.CONNECTED, (playerId: string) => {
            console.log("playerId : " + playerId)
            this.localPlayerId = playerId;
        });

        // Snapshot complet au spawn
        this.eventBus.on(EventBusMessage.PLAYERS_INIT, (players: PlayerInfo[]) => {
            this.gameState.restorePlayers(players);
            this.localPlayer = new Player("", { x: 0, y: 0 }, 100, 10, this.localPlayerId!, this.eventBus, this.inputHandler, this.attackService, this.movementService);
            let localPlayer = this.gameState.getPlayer(this.localPlayerId!);
            this.localPlayer.updateFromInfo(localPlayer!);
        });

        // MAJ unique pour tout changement de joueur
        this.eventBus.on(EventBusMessage.PLAYER_UPDATED, (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
        });

        // Nouveau joueur
        this.eventBus.on(EventBusMessage.PLAYER_JOINED, (player: PlayerInfo) => {
            this.gameState.addPlayer(player);
        });

        // Joueur parti
        this.eventBus.on(EventBusMessage.PLAYER_LEFT, (playerId: string) => {
            this.gameState.removePlayer(playerId);
        });

        // Résultat attaque
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult: AttackResult) => {
            this.handleAttackResult(attackResult);
        });

        this.eventBus.on(EventBusMessage.PLAYER_DIED, (player: PlayerInfo) => {
            this.gameState.updatePlayer(player);
        });
    }

    private handleAttackResult(attackResult: AttackResult) {
        const hitPlayers = attackResult.hitPlayers;
        const attacker = GameState.instance.getPlayer(attackResult.attackerId)!;
        for (const hit of hitPlayers) {
            this.gameState.updatePlayer(hit);
            if (hit.id === this.localPlayerId) {
                const dx = this.localPlayer!.position.x - attacker.position.x;
                const dy = this.localPlayer!.position.y - attacker.position.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;

                const knockbackStrength = attackResult.knockbackStrength;
                this.localPlayer!.knockbackReceivedVector = {
                    x: (dx / len) * knockbackStrength,
                    y: (dy / len) * knockbackStrength,
                };
                this.localPlayer!.knockbackTimer = KNOCKBACK_TIMER;
                this.localPlayer?.takeDamage(20);// todo ajust.
            }
        }
    }

    public handleAttackReceived(attackResult: AttackResult) {
        
        // Hp already set by the server
        // todo IF BLOCKING APPLY KNOCKBACK TO ATTACKER
        const attacker = this.gameState.players.get(attackResult.attackerId);
        const player = this.gameState.players.get(this.localPlayerId!);
        if (!player) throw new Error("Player not in game received damage.");

        if (!attacker) return;
        let didBlock = false;
        if (player.isDead) {
            // this.handleDeath(player);
            return;
        }
        // If player is blocking
        // if (player.getState() === PlayerState.BLOCKING) // todo check if in correction direction serverside
        // {
        //     didBlock = true;
        // }
        this.renderer.updateHealthBar(player.hp, 100);
        const dx = player.position.x - attacker.position.x;
        const dy = player.position.y - attacker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const knockbackStrength = !didBlock ? attackResult.knockbackStrength : attackResult.knockbackStrength / 2;
        player.knockbackReceivedVector = {
            x: (dx / len) * knockbackStrength,
            y: (dy / len) * knockbackStrength,
        };
        // if (!didBlock) player.setState(PlayerState.HIT);
        player.knockbackTimer = KNOCKBACK_TIMER; // Frames de knockback // TODO CHANGE THIS FROM ATTACK
    }

    private handleAttackDash(player: Player, delta: number) {
        if (!player.attackDashTimer || player.attackDashTimer <= 0) return;

        // Progression totale du dash (0 → 1)
        const t = 1 - player.attackDashTimer / player.attackDashDuration!;

        // Fonction mathématique     avec freeze
        const freezeRatio = 10 / player.attackDashDuration!; // 15 premières frames sans mouvement
        const p = 9; // contrôle la douceur
        let speedFactor = 0;

        if (t >= freezeRatio) {
            const tPrime = (t - freezeRatio) / (1 - freezeRatio);
            speedFactor = Math.pow(4, p) * Math.pow(tPrime, p) * Math.pow(1 - tPrime, p);
        }

        const speed = player.attackDashMaxSpeed * speedFactor;

        // Déplacement
        player.position.x += player.mouseDirection.x * speed;
        player.position.y += player.mouseDirection.y * speed;

        player.attackDashTimer -= delta;
        // player.setState(PlayerState.ATTACK_DASH);
        this.eventBus.emit(EventBusMessage.LOCAL_PLAYER_UPDATED, player.toInfo())

        if (player.attackDashTimer <= 0) {

            this.attackService.performAttack(player);
            // player.pendingAttack = false;
        }
    }


    public update(delta: number) {

        if (!this.localPlayer) return;


        // // Receive knockback
        // 

        // Handle attack dash if ongoing
        this.localPlayer.update(delta);

        // render world
        const tileX = Math.floor(this.localPlayer.position.x / TILE_SIZE);
        const tileY = Math.floor(this.localPlayer.position.y / TILE_SIZE);
        const chunkX = Math.floor(tileX / CHUNK_SIZE);
        const chunkY = Math.floor(tileY / CHUNK_SIZE);
        if (chunkX != this.currentChunkX || chunkY != this.currentChunkY) {
            this.currentChunkX = chunkX;
            this.currentChunkY = chunkY;
            this.renderer.worldRenderer.update(chunkX, chunkY);
        }

        this.renderer.updateCamera(this.localPlayer.position)
        // Minimap
        this.inputHandler.update();
        this.renderer.updateMinimap(this.localPlayer.id);
        this.teleportService.update(this.localPlayer, delta);
        this.blockService.update(this.localPlayer, delta);
        this.attackService.update(delta, this.localPlayer);
    }
}
