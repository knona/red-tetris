import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomService } from './room.service';
import { PlayerService } from './player.service';
import { IsExistingRoom } from './validation/is-existing-room.validator';
import { SocketService } from './socket.service';
import { GameService } from './game.service';

@Module({
  providers: [EventsGateway, GameService, PlayerService, RoomService, SocketService, IsExistingRoom]
})
export class EventsModule {}
