import Player from "../../../shared/Player";
import type PlayerInfo from "../../../shared/PlayerInfo";
import type { LocalPlayer } from "./LocalPlayer";

export class GameState {
    public players: Map<string, Player> = new Map(); // Contains localplayer
    private localPlayer?: Player;
    private static _instance:GameState;

    private constructor() { }

    public static get instance(): GameState {
        if (!GameState._instance) {
            GameState._instance = new GameState();
        }

        return GameState._instance;
    }

    setLocalPlayer(localPlayer:LocalPlayer){
        this.localPlayer = localPlayer;
        this.players.set(localPlayer.id, localPlayer);
    }


    getLocalPlayer(): LocalPlayer{
        if(!this.localPlayer) throw new Error("local player shouldn't be undefined.");
        return this.localPlayer;
    }

    addPlayer(newPlayer:PlayerInfo){
        const playerObj = new Player(newPlayer.position,newPlayer.hp, newPlayer.speed, newPlayer.id);
            playerObj.attackDashDuration = newPlayer.attackDashDuration;
            playerObj.attackDashMaxSpeed = newPlayer.attackDashMaxSpeed;
            playerObj.attackDashTimer = newPlayer.attackDashTimer;
            playerObj.attackIndex = newPlayer.attackIndex;
            playerObj.blockTimer = newPlayer.blockTimer;
            playerObj.currentAction = newPlayer._currentAction;
            playerObj.currentDirection = newPlayer.currentDirection;
            playerObj.dashDir = newPlayer.dashDir;
            playerObj.hp = newPlayer.hp;
            playerObj.isBlocking = newPlayer.isBlocking;
            playerObj.knockbackReceived = newPlayer.knockbackReceived;
            playerObj.knockbackTimer = newPlayer.knockbackTimer;
            playerObj.pendingAttack = newPlayer.pendingAttack;
            playerObj.pendingAttackDir = newPlayer.pendingAttackDir;
        this.players.set(newPlayer.id, playerObj);
        
    }

    updatePlayer(player: PlayerInfo) {
        if(!this.localPlayer || player.id == this.localPlayer?.id)
            return; // the local player is already updated at this point

        const existing = this.players.get(player.id);
        if (existing) {
            existing.position = player.position;
            existing.currentAction = player._currentAction;
            existing.speed = player.speed;
            existing.hp = player.hp;
        } else {
            throw new Error("updating player not in gamestate");
            // this.players.set(player.id, player);
        }
    }

    restorePlayerState(players: PlayerInfo[], localPlayer:LocalPlayer) {
        this.players.clear();
        for(const newPlayer of players){
            if(newPlayer.id == localPlayer.id){
                this.players.set(localPlayer.id, localPlayer);
                continue;
            }
            const playerObj = new Player(newPlayer.position,newPlayer.hp, newPlayer.speed, newPlayer.id);
            playerObj.attackDashDuration = newPlayer.attackDashDuration;
            playerObj.attackDashMaxSpeed = newPlayer.attackDashMaxSpeed;
            playerObj.attackDashTimer = newPlayer.attackDashTimer;
            playerObj.attackIndex = newPlayer.attackIndex;
            playerObj.blockTimer = newPlayer.blockTimer;
            playerObj.currentAction = newPlayer._currentAction;
            playerObj.currentDirection = newPlayer.currentDirection;
            playerObj.dashDir = newPlayer.dashDir;
            playerObj.hp = newPlayer.hp;
            playerObj.isBlocking = newPlayer.isBlocking;
            playerObj.knockbackReceived = newPlayer.knockbackReceived;
            playerObj.knockbackTimer = newPlayer.knockbackTimer;
            playerObj.pendingAttack = newPlayer.pendingAttack;
            playerObj.pendingAttackDir = newPlayer.pendingAttackDir;
            this.players.set(newPlayer.id, playerObj);
        }
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }
}
