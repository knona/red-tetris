import { Injectable } from '@nestjs/common';
import { EventException } from 'src/modules/events/exceptions/event.exception';
import { GamingRoom } from 'src/modules/events/models/GamingRoom';
import { Player } from 'src/modules/events/models/Player';
import { Room, RoomType } from 'src/modules/events/models/Room';
import { SocketService } from './socket.service';

@Injectable()
export class RoomService {
  private _waitingRoom: Room = Room.create('Waiting Room', RoomType.WaitingRoom);
  private _rooms: { [id: string]: GamingRoom } = {};

  public constructor(private readonly socketService: SocketService) {}

  public get waitingRoom(): Room {
    return this._waitingRoom;
  }

  public get rooms(): { [id: string]: GamingRoom } {
    return this._rooms;
  }

  public getRooms(): { rooms: GamingRoom[] } {
    return { rooms: Object.values(this._rooms) };
  }

  public getRoom(roomId: string): { room: Room } {
    const room: Room = roomId === this._waitingRoom.id ? this._waitingRoom : this._rooms[roomId];
    if (!room) {
      throw new EventException('Room does not exist');
    }
    return { room };
  }

  public isExistingRoom(roomId: string): boolean {
    return roomId === this._waitingRoom.id || !!this._rooms[roomId];
  }

  public create(player: Player, name: string): { room: GamingRoom } {
    const room: GamingRoom = GamingRoom.create(name);
    this._rooms[room.id] = room;

    if (player.currentRoom) {
      this.removePlayer(player, player.currentRoom);
    }
    room.add(player);
    room.managerId = player.id;
    this.socketService.addPlayerToRoom(player, room, this._waitingRoom);
    player.currentRoom = room.id;
    this.socketService.createRoom(room, this._waitingRoom);
    return { room };
  }

  public delete(player: Player, roomId: string): void {
    const room: GamingRoom = this._rooms[roomId];
    if (room.managerId !== player.id) {
      throw new EventException('Player cannot delete a room that he does not manage');
    }
    if (room.game.status === 'started') {
      throw new EventException("You can't delete room with a started game");
    }
    this.socketService.deleteRoom(roomId, this._waitingRoom);
    room.players.forEach(playerInRoom => {
      playerInRoom.currentRoom = '';
      this.addPlayer(playerInRoom, this._waitingRoom.id);
    });
    delete this._rooms[roomId];
  }

  public addPlayer(player: Player, roomId: string): { room: Room } {
    const room: Room = roomId === this._waitingRoom.id ? this._waitingRoom : this._rooms[roomId];
    if (room.getPlayer(player.id)) {
      return;
    }
    if (room instanceof GamingRoom && room.game.status === 'started') {
      throw new EventException("You can't join a room with a started game");
    }
    if (player.currentRoom) {
      this.removePlayer(player, player.currentRoom);
    }
    room.add(player);
    this.socketService.addPlayerToRoom(player, room, this._waitingRoom);
    player.currentRoom = room.id;
    return { room };
  }

  public addPlayerToWaitingRoom(player: Player): { room: Room } {
    return this.addPlayer(player, this._waitingRoom.id);
  }

  public removePlayer(player: Player, roomId: string): void {
    const room: Room = roomId === this._waitingRoom.id ? this._waitingRoom : this._rooms[roomId];

    if (!room.getPlayer(player.id)) {
      return;
    }
    room.remove(player);
    this.socketService.removePlayerFromRoom(player, room, this._waitingRoom);
    player.currentRoom = '';
    if (room.type === RoomType.GamingRoom) {
      const gamingRoom: GamingRoom = room as GamingRoom;
      if (gamingRoom.nbPlayers === 0) {
        this.socketService.deleteRoom(gamingRoom.id, this._waitingRoom);
        delete this._rooms[gamingRoom.id];
      } else if (player.id === gamingRoom.managerId) {
        gamingRoom.managerId = gamingRoom.players[0].id;
        this.socketService.changeRoomManager(gamingRoom);
      }
    }
  }
}
