/* eslint-disable */
import { Test } from '@nestjs/testing';
import { EventException } from 'src/modules/events/exceptions/event.exception';
import { Player } from 'src/modules/events/models/Player';
import { RoomService } from 'src/modules/events/room.service';
import { SocketService } from 'src/modules/events/socket.service';

const socketService = {
  createRoom: jest.fn(),
  deleteRoom: jest.fn(),
  addPlayerToRoom: jest.fn(),
  removePlayerFromRoom: jest.fn(),
  changeRoomManager: jest.fn()
};

describe('Room Service', () => {
  let roomService: RoomService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [RoomService, SocketService] })
      .overrideProvider(SocketService)
      .useValue(socketService)
      .compile();
    await moduleRef.init();
    roomService = await moduleRef.resolve<RoomService>(RoomService);
  });

  describe('getRoom', () => {
    it('should throw an error', async () => {
      expect(() => roomService.getRoom('hello')).toThrow(EventException);
    });

    it('should return the room created', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      expect(roomService.getRoom(room.id)).toStrictEqual({ room });
    });
  });

  describe('isExistingRoom', () => {
    it('should return false', async () => {
      expect(roomService.isExistingRoom('hello')).toBeFalsy();
    });

    it('should return true', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      expect(roomService.isExistingRoom(room.id)).toBeTruthy();
    });
  });

  describe('getRooms', () => {
    it('should return an empty array', async () => {
      expect(roomService.getRooms()).toStrictEqual({ rooms: [] });
    });

    it('should return an array with one element', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      expect(roomService.getRooms()).toStrictEqual({ rooms: [room] });
    });
  });

  describe('create', () => {
    it('should create a room and add set the player as manager', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      expect(roomService.rooms[room.id]).toStrictEqual(room);
      expect(room.players[0]).toStrictEqual(fakePlayer);
      expect(room.managerId).toBe(fakePlayer.id);
    });

    it('should return an array with two elements', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const fakePlayer2: Player = Player.create('mysuperuser2', 'socket-id2');

      const { room: room1 } = roomService.create(fakePlayer, 'my-super-room');
      const { room: room2 } = roomService.create(fakePlayer2, 'my-super-room');
      expect(roomService.getRooms()).toStrictEqual({ rooms: [room1, room2] });
    });

    it('should return an array with only one element', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');

      const { room: room1 } = roomService.create(fakePlayer, 'my-super-room');
      const { room: room2 } = roomService.create(fakePlayer, 'my-super-room');
      expect(roomService.getRooms()).toStrictEqual({ rooms: [room2] });
    });
  });

  describe('delete', () => {
    it('should not be able to delete room if not the manager', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const fakePlayer2: Player = Player.create('mysuperuser2', 'socket-id2');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      roomService.addPlayer(fakePlayer2, room.id);
      expect(() => roomService.delete(fakePlayer2, room.id)).toThrow(EventException);
    });

    it('should delete the room created by an user', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.create(fakePlayer, 'my-super-room');

      socketService.deleteRoom.mockClear();
      socketService.removePlayerFromRoom.mockClear();
      socketService.addPlayerToRoom.mockClear();
      roomService.delete(fakePlayer, room.id);
      expect(() => roomService.getRoom(room.id)).toThrow(EventException);
      expect(fakePlayer.currentRoom).toBe(roomService.waitingRoom.id);
      expect(socketService.addPlayerToRoom.mock.calls.length).toBe(1);
      expect(socketService.deleteRoom.mock.calls.length).toBe(1);
      expect(socketService.removePlayerFromRoom.mock.calls.length).toBe(0);
    });
  });

  describe('join', () => {
    it('should add the player to waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');

      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(fakePlayer.currentRoom).toBe(roomService.waitingRoom.id);
      expect(roomService.waitingRoom.players[0]).toStrictEqual(fakePlayer);
    });

    it('should delete the created room after joining the waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');

      roomService.create(fakePlayer, 'my-super-room');
      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(fakePlayer.currentRoom).toBe(roomService.waitingRoom.id);
      expect(roomService.getRooms()).toStrictEqual({ rooms: [] });
    });
  });

  describe('leave', () => {
    it('should return an empty array', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');

      const { room } = roomService.create(fakePlayer, 'my-super-room');
      roomService.removePlayer(fakePlayer, room.id);
      expect(fakePlayer.currentRoom).toBe('');
      expect(roomService.getRooms()).toStrictEqual({ rooms: [] });
    });

    it('leaving the waiting room should not delete it', async () => {
      socketService.deleteRoom.mockClear();
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const { room } = roomService.addPlayerToWaitingRoom(fakePlayer);
      roomService.removePlayer(fakePlayer, room.id);
      expect(socketService.deleteRoom.mock.calls.length).toBe(0);
      expect(fakePlayer.currentRoom).toBe('');
      expect(roomService.getRooms()).toStrictEqual({ rooms: [] });
    });

    it('should change room manager', async () => {
      socketService.changeRoomManager.mockClear();
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      const fakePlayer2: Player = Player.create('mysuperuser2', 'socket-id2');
      const { room } = roomService.create(fakePlayer, 'my-super-room');
      roomService.addPlayer(fakePlayer2, room.id);
      roomService.removePlayer(fakePlayer, room.id);
      expect(room.managerId).toBe(fakePlayer2.id);
      expect(socketService.changeRoomManager.mock.calls.length).toBe(1);
    });
  });
});
