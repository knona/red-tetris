import { Logger, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamingRoom } from 'src/modules/events/models/GamingRoom';
import { Player } from 'src/modules/events/models/Player';
import { Room } from 'src/modules/events/models/Room';
import { PlayerSocket } from 'src/modules/events/utils/player-socket.type';
import { ConnectedGuard } from './authentification/connected.guard';
import { NotConnected } from './authentification/not-connected.decorator';
import { Public } from './authentification/public.decorator';
import { EventExceptionsFilter } from './exceptions/event-exceptions.filter';
import { EventException } from './exceptions/event.exception';
import { GameService } from './game.service';
import { Piece } from './models/Piece';
import { PlayerService } from './player.service';
import { EventResponseInterceptor } from './response/event-response.interceptor';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';
import { EventLogMiddleware } from './utils/event-log.middleware';
import { EventRoute } from './utils/event-route.decorator';
import { ConnectionDto } from './validation/connection.dto';
import { CreateRoomDto } from './validation/create-room.dto';
import { exceptionFactoryValidation } from './validation/exception-factory-validation';
import { RoomDto } from './validation/room.dto';
import { UpdatePlayerGameDto } from './validation/update-playe-game.dto';

@WebSocketGateway()
@UseFilters(EventExceptionsFilter)
@UseInterceptors(EventResponseInterceptor)
@UseGuards(EventLogMiddleware, ConnectedGuard)
@UsePipes(new ValidationPipe({ exceptionFactory: exceptionFactoryValidation }))
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  public constructor(
    private readonly roomService: RoomService,
    private readonly playerService: PlayerService,
    private readonly socketService: SocketService,
    private readonly gameService: GameService
  ) {}

  private _logger: Logger = new Logger('EventsGateway');

  public afterInit(server: Server): void {
    this._logger.log('Init');
    this.socketService.init(server);
  }

  public handleConnection(@ConnectedSocket() client: Socket): void {
    this._logger.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(@ConnectedSocket() client: Socket): void {
    if (this.playerService.isPlayerConnected(client.id)) {
      const player: Player = this.playerService.getPlayer(client.id);
      try {
        this.gameService.gameOver(player);
      } catch (err) {
        if (!(err instanceof EventException)) {
          throw err;
        }
      }
      this.roomService.removePlayer(player, player.currentRoom);
      this.playerService.disconnection(client.id);
      this._logger.log(`Client disconnected: ${player.username}`);
    } else {
      this._logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @EventRoute(':test')
  @Public()
  public test(@MessageBody() data: { message: string }): { incoming: typeof data } {
    this._logger.log('Test message: ' + data.message, ':test');
    return { incoming: data };
  }

  @EventRoute(':connection')
  @NotConnected()
  public connection(
    @MessageBody() { username }: ConnectionDto,
    @ConnectedSocket() client: Socket
  ): { player: Player; room: Room } {
    const player: Player = this.playerService.connection(username, client.id);
    const { room }: { room: Room } = this.roomService.addPlayerToWaitingRoom(player);
    return { player, room };
  }

  @EventRoute(':get_rooms')
  public getRooms(): { rooms: GamingRoom[] } {
    return this.roomService.getRooms();
  }

  @EventRoute(':get_room')
  public getRoom(@MessageBody() { roomId }: RoomDto): { room: Room } {
    return this.roomService.getRoom(roomId);
  }

  @EventRoute(':create_room')
  public roomCreate(
    @MessageBody() { name }: CreateRoomDto,
    @ConnectedSocket() client: PlayerSocket
  ): { room: GamingRoom } {
    return this.roomService.create(client.player, name);
  }

  @EventRoute(':delete_room')
  public roomDelete(@MessageBody() { roomId }: RoomDto, @ConnectedSocket() client: PlayerSocket): void {
    this.roomService.delete(client.player, roomId);
  }

  @EventRoute(':join_room')
  public addPlayer(@MessageBody() { roomId }: RoomDto, @ConnectedSocket() client: PlayerSocket): void {
    this.roomService.addPlayer(client.player, roomId);
  }

  @EventRoute(':join_waiting_room')
  public addPlayerToWaitingRoom(@ConnectedSocket() client: PlayerSocket): void {
    this.roomService.addPlayerToWaitingRoom(client.player);
  }

  @EventRoute(':start_game')
  public startGame(@ConnectedSocket() client: PlayerSocket): void {
    this.gameService.start(client.player);
  }

  @EventRoute(':next_pieces')
  public nextPieces(@ConnectedSocket() client: PlayerSocket): void {
    this.gameService.nextPieces(client.player);
  }

  @EventRoute(':update_player_game')
  public updatePlayerGame(
    @MessageBody()
    { piece, playfield, deletedLines }: UpdatePlayerGameDto,
    @ConnectedSocket() client: PlayerSocket
  ): void {
    this.gameService.updatePlayerGame(client.player, piece && Piece.fromJSON(piece), playfield, deletedLines);
  }

  @EventRoute(':game_over')
  public gameOver(@ConnectedSocket() client: PlayerSocket): void {
    this.gameService.gameOver(client.player);
  }
}
