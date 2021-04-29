import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { GamingRoom } from './models/GamingRoom';
import { Piece } from './models/Piece';
import { Player } from './models/Player';
import { Playfield } from './models/Playfield';
import { Room } from './models/Room';

@Injectable()
export class SocketService {
  private _server: Server;

  public init(server: Server): void {
    this._server = server;
  }

  public createRoom(room: Room, waitingRoom: Room): void {
    this._server.to(waitingRoom.id).emit('room_created', { room });
  }

  public deleteRoom(roomId: string, waitingRoom: Room): void {
    this._server.to(roomId).socketsJoin(waitingRoom.id);
    this._server.to(roomId).socketsLeave(roomId);
    this._server.to(waitingRoom.id).emit('room_deleted', { room: { id: roomId } });
  }

  public addPlayerToRoom(player: Player, room: Room, waitingRoom: Room): void {
    this._server
      .to(waitingRoom.id)
      .to(room.id)
      .to(player.socketId)
      .emit('player_joined', { room: { id: room.id, nbPlayers: room.nbPlayers }, player });
    this._server.to(player.socketId).socketsJoin(room.id);
  }

  public removePlayerFromRoom(player: Player, room: Room, waitingRoom: Room): void {
    this._server.to(player.socketId).socketsLeave(room.id);
    this._server
      .to(waitingRoom.id)
      .to(room.id)
      .to(player.socketId)
      .emit('player_left', { room: { id: room.id, nbPlayers: room.nbPlayers }, player: { id: player.id } });
  }

  public changeRoomManager(room: GamingRoom): void {
    this._server.to(room.id).emit('room_manager_changed', {
      room: { id: room.id, managerId: room.managerId }
    });
  }

  public startGame(room: GamingRoom, waitingRoomId: string, pieces: Piece[]): void {
    this._server
      .to(room.id)
      .to(waitingRoomId)
      .emit('game_start', { room: { id: room.id, game: room.game }, pieces });
  }

  public endGame(room: GamingRoom, waitingRoomId: string): void {
    this._server
      .to(room.id)
      .to(waitingRoomId)
      .emit('game_end', { room: { id: room.id, game: { status: room.game.status } } });
  }

  public gameOver(player: Player, room: GamingRoom): void {
    this._server.to(room.id).emit('game_over', {
      player: { id: player.id },
      room: { id: room.id, game: { aliveIds: room.game.aliveIds, loserIds: room.game.loserIds } }
    });
  }

  public nextPieces(players: Player[], roomId: string, pieces: Piece[]): void {
    this._server.to(players.map(player => player.socketId)).emit('next_pieces', { room: { id: roomId }, pieces });
  }

  public updatePlayerGame(
    player: Player,
    players: Player[],
    roomId: string,
    piece?: Piece,
    playfield?: Playfield
  ): void {
    this._server
      .to(players.map(roomPlayer => roomPlayer.socketId))
      .except(player.socketId)
      .emit('update_player_game', {
        room: { id: roomId },
        player: { id: player.id },
        piece,
        playfield
      });
  }

  public attack(player: Player, players: Player[], roomId: string, nLines: number): void {
    this._server
      .to(players.map(roomPlayer => roomPlayer.socketId))
      .except(player.socketId)
      .emit('attack', { room: { id: roomId }, nLines });
  }
}
