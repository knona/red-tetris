import { v4 as uuidv4 } from 'uuid';

export interface PlayerJSON {
  id: string;
  username: string;
}

export class Player {
  private _id: string;
  private _username: string;
  private _socketId: string;
  private _currentRoom: string;

  private constructor(username: string, socketId: string) {
    this._username = username;
    this._id = uuidv4();
    this._socketId = socketId;
    this._currentRoom = '';
  }

  public get id(): string {
    return this._id;
  }

  public get username(): string {
    return this._username;
  }

  public get socketId(): string {
    return this._socketId;
  }

  public get currentRoom(): string {
    return this._currentRoom;
  }

  public set currentRoom(id: string) {
    this._currentRoom = id;
  }

  public static create(username: string, socketId: string): Player {
    return new Player(username, socketId);
  }

  public toJSON(): PlayerJSON {
    return {
      id: this._id,
      username: this._username
    };
  }
}
