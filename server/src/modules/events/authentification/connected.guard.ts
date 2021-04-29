import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { PlayerService } from 'src/modules/events/player.service';
import { PlayerSocket } from '../utils/player-socket.type';

@Injectable()
export class ConnectedGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector, private readonly playerService: PlayerService) {}

  public canActivate(context: ExecutionContext): boolean {
    const ws: WsArgumentsHost = context.switchToWs();
    const client: PlayerSocket = ws.getClient();

    const isPublic: boolean = this.reflector.get<boolean>('is-public', context.getHandler());
    if (isPublic) {
      return true;
    }
    client.player = this.playerService.getPlayer(client.id);
    return true;
  }
}
