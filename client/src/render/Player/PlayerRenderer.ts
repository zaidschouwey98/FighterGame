import type { Container, Spritesheet } from "pixi.js";
import type Player from "../../core/player/Player";
import PlayerSprite from "./PlayerSprite";

export class PlayerRenderer {
  private playerSprites = new Map<string, PlayerSprite>();

  constructor(
    private _playerContainer:Container, 
    private _spriteSheets:Spritesheet[],
    private _terrainContainer: Container, 
    private _staticEffectsContainer: Container, 
    private _playerName: string
){}

  public addNewPlayer(playerId: string) {
    const sprite = new PlayerSprite(playerId, this._playerContainer, this._spriteSheets,this._terrainContainer, this._staticEffectsContainer, this._playerName);
    this.playerSprites.set(playerId, sprite);
  }

  public removePlayer(playerId: string) {
    const sprite = this.playerSprites.get(playerId);
    if (sprite) {
      sprite.destroy();
      this.playerSprites.delete(playerId);
    }
  }

  public updatePlayers(players: Player[]) {
    for (const player of players) {
      const sprite = this.playerSprites.get(player.id);
      if (sprite) sprite.update(player);
    }
  }

  public showAttackEffect(attackData: any) {
    const sprite = this.playerSprites.get(attackData.playerId);
    // sprite?.playAttackAnimation(attackData.playerState, attackData.rotation);
  }

  public renderDyingPlayer(player: Player) {
    // this.playerSprites.get(player.id)?.playDyingAnimation(player.position);
  }
}
