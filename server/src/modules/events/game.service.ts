import { Injectable } from '@nestjs/common';
import { EventException } from './exceptions/event.exception';
import { GamingRoom } from './models/GamingRoom';
import { Piece } from './models/Piece';
import { Player } from './models/Player';
import { Playfield } from './models/Playfield';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';

@Injectable()
export class GameService {
  public constructor(private readonly roomService: RoomService, private readonly socketService: SocketService) {}

  public getRoom(player: Player): GamingRoom {
    if (!player.currentRoom || player.currentRoom === this.roomService.waitingRoom.id) {
      throw new EventException('Player is not in any gaming room');
    }
    return this.roomService.getRoom(player.currentRoom).room as GamingRoom;
  }

  public getRoomWithStartedGame(player: Player): GamingRoom {
    const room: GamingRoom = this.getRoom(player);
    if (room.game.status !== 'started') {
      return undefined;
    }
    return room;
  }

  public start(player: Player): void {
    const room: GamingRoom = this.getRoom(player);
    if (room.managerId !== player.id) {
      throw new EventException('Player is not the manager of the room');
    }
    room.game.start(room.players);
    const pieces: Piece[] = Piece.getMultipleBag(5);
    this.socketService.startGame(room, this.roomService.waitingRoom.id, pieces);
  }

  public nextPieces(player: Player): void {
    const room: GamingRoom = this.getRoomWithStartedGame(player);
    if (!room) {
      return;
    }
    const pieces: Piece[] = Piece.getMultipleBag(5);
    this.socketService.nextPieces(room.game.alives, room.id, pieces);
  }

  public gameOver(player: Player): void {
    const room: GamingRoom = this.getRoomWithStartedGame(player);
    if (!room) {
      return;
    }
    if (!room.game.alives.some(alivePlayer => alivePlayer.id === player.id)) {
      throw new EventException('Player is not alive');
    }
    room.game.gameOver(player.id);
    this.socketService.gameOver(player, room);
    if (room.game.checkEnd()) {
      this.socketService.endGame(room, this.roomService.waitingRoom.id);
    }
  }

  public updatePlayerGame(player: Player, piece?: Piece, playfield?: Playfield, deletedLines?: number): void {
    const room: GamingRoom = this.getRoomWithStartedGame(player);
    if (!room) {
      return;
    }
    this.socketService.updatePlayerGame(player, room.id, piece, playfield);
    if (deletedLines !== undefined && deletedLines >= 2) {
      this.socketService.attack(player, room.game.alives, room.id, deletedLines - 1);
    }
  }
}
