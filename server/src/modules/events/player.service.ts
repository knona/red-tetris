import { Injectable } from '@nestjs/common';
import { EventException } from 'src/modules/events/exceptions/event.exception';
import { Player } from 'src/modules/events/models/Player';

@Injectable()
export class PlayerService {
  private _players: { [socketId: string]: Player } = {};

  public get players(): { [socketId: string]: Player } {
    return this._players;
  }

  public getPlayer(socketId: string): Player {
    const player: Player = this._players[socketId];
    if (!player) {
      throw new EventException('The player has not been created');
    }
    return player;
  }

  public isPlayerConnected(socketId: string): boolean {
    return !!this._players[socketId];
  }

  public connection(username: string, socketId: string): Player {
    const player: Player = Player.create(username, socketId);
    this._players[socketId] = player;
    return player;
  }

  public disconnection(socketId: string): Player {
    const player: Player = this._players[socketId];
    delete this._players[socketId];
    return player;
  }
}
