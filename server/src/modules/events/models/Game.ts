import { Player } from './Player';

type GameStatus = 'started' | 'finished';

export interface GameJSON {
  status: GameStatus;
  players: Player[];
  aliveIds: string[];
  loserIds: string[];
}

export class Game {
  private _status: GameStatus = 'finished';
  private _players: Player[] = [];
  private _alives: Player[] = [];
  private _losers: Player[] = [];

  public get status(): GameStatus {
    return this._status;
  }

  public get players(): Player[] {
    return this._players;
  }

  public get alives(): Player[] {
    return this._alives;
  }

  public get losers(): Player[] {
    return this._losers;
  }

  public get aliveIds(): string[] {
    return this._alives.map(alive => alive.id);
  }

  public get loserIds(): string[] {
    return this._losers.map(player => player.id);
  }

  public start(players: Player[]): void {
    this._status = 'started';
    this._players = [...players];
    this._alives = [...players];
    this._losers = [];
  }

  public gameOver(playerId: string): void {
    const playerIndex: number = this._alives.findIndex(player => player.id === playerId);
    this._losers.push(...this._alives.splice(playerIndex, 1));
  }

  public checkEnd(): boolean {
    if (this._alives.length === 0 || (this._alives.length === 1 && this._losers.length !== 0)) {
      this._status = 'finished';
      this._players = [];
      this._alives = [];
      this._losers = [];
      return true;
    }
    return false;
  }

  public toJSON(): GameJSON {
    return {
      status: this._status,
      players: this.players,
      aliveIds: this.aliveIds,
      loserIds: this.loserIds
    };
  }
}
