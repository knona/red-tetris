import { v4 as uuidv4 } from 'uuid';
import { Player, PlayerJSON } from './Player';

export interface RoomJSON {
  id: string;
  name: string;
  nbPlayers: number;
  players: PlayerJSON[];
  type: RoomType;
}

export enum RoomType {
  WaitingRoom = 'WaitingRoom',
  GamingRoom = 'GamingRoom'
}

export class Room {
  protected _id: string;
  protected _name: string;
  protected _nbPlayers: number;
  protected _players: { [id: string]: Player };
  protected _type: RoomType;

  protected constructor(name: string, roomType: RoomType) {
    this._name = name;
    this._id = uuidv4();
    this._players = {};
    this._nbPlayers = 0;
    this._type = roomType;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get nbPlayers(): number {
    return this._nbPlayers;
  }

  public get type(): RoomType {
    return this._type;
  }

  public get players(): Player[] {
    return Object.values(this._players);
  }

  public static create(name: string, roomType: RoomType): Room {
    return new Room(name, roomType);
  }

  public add(player: Player): void {
    this._players[player.id] = player;
    this._nbPlayers++;
  }

  public remove(player: Player): void {
    delete this._players[player.id];
    this._nbPlayers--;
  }

  public getPlayer(playerId: string): Player {
    return this._players[playerId];
  }

  public toJSON(): RoomJSON {
    return {
      id: this._id,
      name: this._name,
      nbPlayers: this._nbPlayers,
      players: Object.values(this._players).map(player => player.toJSON()),
      type: this._type
    };
  }
}
