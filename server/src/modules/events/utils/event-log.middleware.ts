import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PlayerService } from '../player.service';
import { PlayerSocket } from './player-socket.type';

@Injectable()
export class EventLogMiddleware implements CanActivate {
  public constructor(private reflector: Reflector, private playerService: PlayerService) {}

  private logger: Logger = new Logger();

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ws: WsArgumentsHost = context.switchToWs();
    const client: PlayerSocket = ws.getClient();
    const eventName: string = this.reflector.get<string>('event-name', context.getHandler());
    let clientName: string = client.id;
    if (this.playerService.isPlayerConnected(client.id)) {
      clientName = this.playerService.getPlayer(client.id).username;
    }
    this.logger.log(`event '${eventName}' received from ${clientName}`, `Event ${eventName}`);
    return true;
  }
}
