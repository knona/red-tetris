import { EventException } from '../exceptions/event.exception';
import { Game, GameJSON } from './Game';
import { Player } from './Player';
import { Room, RoomJSON, RoomType } from './Room';

export interface GamingRoomJSON extends RoomJSON {
  managerId: string;
  maxPlayer: number;
  game: GameJSON;
}

export class GamingRoom extends Room {
  private _managerId: string;
  private _maxPlayer: number = 5;
  private _game: Game = new Game();

  private constructor(name: string) {
    super(name, RoomType.GamingRoom);
  }

  public get maxPlayer(): number {
    return this._maxPlayer;
  }

  public get managerId(): string {
    return this._managerId;
  }

  public set managerId(playerId: string) {
    this._managerId = playerId;
  }

  public get game(): Game {
    return this._game;
  }

  public static create(name: string): GamingRoom {
    return new GamingRoom(name);
  }

  public add(player: Player): void {
    if (this._nbPlayers === this.maxPlayer) {
      throw new EventException('The room is full');
    }
    this._players[player.id] = player;
    this._nbPlayers++;
  }

  public toJSON(): GamingRoomJSON {
    return {
      ...super.toJSON(),
      managerId: this._managerId,
      maxPlayer: this._maxPlayer,
      game: this._game.toJSON()
    };
  }
}
