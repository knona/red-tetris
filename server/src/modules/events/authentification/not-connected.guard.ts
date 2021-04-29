import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';
import { Socket } from 'socket.io';
import { PlayerService } from 'src/modules/events/player.service';
import { EventException } from '../exceptions/event.exception';

@Injectable()
export class NotConnectedGuard implements CanActivate {
  public constructor(private readonly playerService: PlayerService) {}

  public canActivate(context: ExecutionContext): boolean {
    const ws: WsArgumentsHost = context.switchToWs();
    const client: Socket = ws.getClient();
    if (this.playerService.isPlayerConnected(client.id)) {
      throw new EventException('The player is already connected');
    }
    return true;
  }
}
