import { Application, Container, Spritesheet } from "pixi.js";
import Player from "./core/player/Player";
import type { AttackData } from "../../shared/AttackData";
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
import { PlayerState } from "../../shared/PlayerState";
import { CHUNK_SIZE, KNOCKBACK_TIMER, TILE_SIZE } from "./constantes";
import { TeleportService } from "./core/TeleportService";


export class GameController {
    private gameState = GameState.instance;
    private eventBus = new EventBus();
    private inputHandler = new InputHandler();
    private coordinateService: CoordinateService;
    private renderer: Renderer;
    private network: NetworkClient;
    private movementService: MovementService;
    private attackService: AttackService;
    private blockService: BlockService
    private localPlayerId: string | null = null;
    private currentChunkX?: number;
    private currentChunkY?: number;
    private teleportService: TeleportService;

    constructor(globalContainer: Container, serverUrl: string, app: Application, spriteSheets: Spritesheet[]) {
        this.setupEventListeners();

        this.renderer = new Renderer(app, globalContainer, spriteSheets,this.eventBus);

        this.coordinateService = new CoordinateService(app, this.renderer.camera);
        this.network = new NetworkClient(serverUrl, this.eventBus);
        this.movementService = new MovementService(this.inputHandler,this.eventBus);
        this.attackService = new AttackService(this.inputHandler, this.coordinateService, this.eventBus);
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

        // Effet attaque
        // this.eventBus.on("attack:effect", (attackData: AttackData) => {
        //     // this.renderer.playerRenderer.showAttackEffect(attackData);
        // });

        // Résultat attaque
        this.eventBus.on(EventBusMessage.ATTACK_RESULT, (attackResult: AttackResult) => {
            this.handleAttackResult(attackResult);
        });
    }

    private handleAttackResult(attackResult: AttackResult) {
        const hitPlayers = attackResult.hitPlayers;

        // Heal si le joueur a tué
        if (attackResult.attackerId === this.localPlayerId && attackResult.killNumber > 0) {
            const local = this.gameState.players.get(this.localPlayerId);
            if(!local) throw new Error("Local player shouldn't be undefined.");
            local.hp += 20 * attackResult.killNumber; // TODO 20 in constante
            this.renderer.updateHealthBar(local.hp, 100);
        }

        // Knockback si bloqué
        if (attackResult.blockedBy && attackResult.attackerId === this.localPlayerId) {
            this.attackService.attackGotBlocked(
                this.gameState.players.get(this.localPlayerId)!, //todo remove "!"
                attackResult.blockedBy.id,
                attackResult.knockbackStrength
            );
        }

        // MAJ des joueurs touchés
        for (const hit of hitPlayers) {
            this.gameState.updatePlayer(hit);
            if (hit.id === this.localPlayerId) {
                this.gameState.players.get(this.localPlayerId)!.hp = hit.hp; // TODO WHAT THE FUCK ?
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
        if (player.getState() === PlayerState.BLOCKING) // todo check if in correction direction serverside
        {
            didBlock = true;
        }
        this.renderer.updateHealthBar(player.hp, 100);
        const dx = player.position.x - attacker.position.x;
        const dy = player.position.y - attacker.position.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const knockbackStrength = !didBlock ? attackResult.knockbackStrength : attackResult.knockbackStrength / 2;
        player.knockbackReceivedVector = {
            x: (dx / len) * knockbackStrength,
            y: (dy / len) * knockbackStrength,
        };
        if (!didBlock) player.setState(PlayerState.HIT);
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
        player.position.x += player.dashDir.x * speed;
        player.position.y += player.dashDir.y * speed;

        player.attackDashTimer -= delta;
        player.setState(PlayerState.ATTACK_DASH);
        this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player)

        if (player.attackDashTimer <= 0) {
            this.attackService.performAttack(player, player.pendingAttackDir!);
            // player.pendingAttack = false;
        }
    }



    public getPlayerState(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    public getLocalPlayerId(): string | null {
        return this.localPlayerId;
    }

    public update(delta: number) {

        if (!this.localPlayerId) return;
        const player = this.gameState.players.get(this.localPlayerId);

        if (!player) return;
        if (player.isDead) {
            // Pas d'inputs ni de mouvements
            return;
        }
        this.renderer.updateCamera(player.position)

        // Receive knockback
        if (player.knockbackTimer && player.knockbackTimer > 0 && player.knockbackReceivedVector) {
            player.position.x += player.knockbackReceivedVector.x * delta;
            player.position.y += player.knockbackReceivedVector.y * delta;
            // Ralentissement progressif
            player.knockbackReceivedVector.x *= 0.85;
            player.knockbackReceivedVector.y *= 0.85;

            player.knockbackTimer -= delta;
            if (player.knockbackTimer <= 0) {
                player.knockbackReceivedVector = undefined;
                player.knockbackTimer = undefined;
            }
            this.eventBus.emit(EventBusMessage.PLAYER_UPDATED, player)

            return;
        }

        // Handle attack dash if ongoing
        if (player.attackDashTimer && player.attackDashTimer > 0) {
            this.handleAttackDash(player, delta);
        } else if (player.blockTimer == undefined || player.blockTimer < 0) {
            this.movementService.handleMovement(player, delta);
        }

        // Handle block and canceling attack
        if (this.attackService.attackOngoing && this.inputHandler.consumeRightClick()) {
            this.attackService.stopAttack();
        } else if (this.inputHandler.consumeRightClick()) {
            this.blockService.startBlock(player);
        }

        // handle attack
        if (this.inputHandler.consumeAttack() && !this.attackService.attackOngoing/* && !player.blockTimer < 0*/) {
            this.attackService.initiateAttack(player);
        }

        // render world
        const tileX = Math.floor(player.position.x / TILE_SIZE);
        const tileY = Math.floor(player.position.y / TILE_SIZE);
        const chunkX = Math.floor(tileX / CHUNK_SIZE);
        const chunkY = Math.floor(tileY / CHUNK_SIZE);
        if (chunkX != this.currentChunkX || chunkY != this.currentChunkY) {
            this.currentChunkX = chunkX;
            this.currentChunkY = chunkY;
            this.renderer.worldRenderer.update(chunkX, chunkY);
        }

        // Minimap
        this.renderer.updateMinimap(this.localPlayerId);
        this.teleportService.update(player, delta);
        this.blockService.update(player, delta);
        this.attackService.update(delta, player);
    }
}
