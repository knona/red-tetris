/* eslint-disable */
import { Test } from '@nestjs/testing';
import { EventException } from 'src/modules/events/exceptions/event.exception';
import { GameService } from 'src/modules/events/game.service';
import { Player } from 'src/modules/events/models/Player';
import { Room } from 'src/modules/events/models/Room';
import { RoomService } from 'src/modules/events/room.service';
import { SocketService } from 'src/modules/events/socket.service';

const socketService = {
  createRoom: jest.fn(),
  deleteRoom: jest.fn(),
  addPlayerToRoom: jest.fn(),
  removePlayerFromRoom: jest.fn(),
  changeRoomManager: jest.fn(),
  startGame: jest.fn(),
  endGame: jest.fn(),
  gameOver: jest.fn(),
  nextPieces: jest.fn(),
  updatePlayerGame: jest.fn(),
  attack: jest.fn()
};

describe('Room Service', () => {
  let gameService: GameService;
  let roomService: RoomService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [GameService, RoomService, SocketService] })
      .overrideProvider(SocketService)
      .useValue(socketService)
      .compile();
    await moduleRef.init();
    roomService = await moduleRef.resolve<RoomService>(RoomService);
    gameService = await moduleRef.resolve<GameService>(GameService);
  });

  describe('start', () => {
    it('should fail because player is not in room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      expect(() => gameService.start(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because player is in waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(() => gameService.start(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because player is not the manager of the room', async () => {
      const fakePlayer1: Player = Player.create('mysuperuser', 'socket-id1');
      const fakePlayer2: Player = Player.create('mysuperuser', 'socket-id2');
      const { room } = roomService.create(fakePlayer1, 'my-super-room');
      roomService.addPlayer(fakePlayer2, room.id);
      expect(() => gameService.start(fakePlayer2)).toThrow(new EventException('Player is not the manager of the room'));
    });

    it('should work', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      socketService.startGame.mockClear();
      gameService.start(fakePlayer);
      expect(socketService.startGame.mock.calls.length).toBe(1);
    });
  });

  describe('nextPieces', () => {
    it('should fail because player is not in room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      expect(() => gameService.nextPieces(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because player is in waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(() => gameService.nextPieces(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because game has not started', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      socketService.nextPieces.mockClear();
      gameService.nextPieces(fakePlayer);
      expect(socketService.nextPieces.mock.calls.length).toBe(0);
    });

    it('should work', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      gameService.start(fakePlayer);
      socketService.nextPieces.mockClear();
      gameService.nextPieces(fakePlayer);
      expect(socketService.nextPieces.mock.calls.length).toBe(1);
    });
  });

  describe('gameOver', () => {
    it('should fail because player is not in room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      expect(() => gameService.gameOver(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because player is in waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(() => gameService.gameOver(fakePlayer)).toThrow(new EventException('Player is not in any gaming room'));
    });

    it('should fail because game has not started', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      socketService.gameOver.mockClear();
      gameService.gameOver(fakePlayer);
      expect(socketService.gameOver.mock.calls.length).toBe(0);
    });

    it('should work and end game', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      gameService.start(fakePlayer);
      socketService.gameOver.mockClear();
      socketService.endGame.mockClear();
      gameService.gameOver(fakePlayer);
      expect(socketService.gameOver.mock.calls.length).toBe(1);
      expect(socketService.endGame.mock.calls.length).toBe(1);
    });

    it('should work and not end game', async () => {
      const fakePlayer1: Player = Player.create('mysuperuser', 'socket-id1');
      const fakePlayer2: Player = Player.create('mysuperuser', 'socket-id2');
      const fakePlayer3: Player = Player.create('mysuperuser', 'socket-id3');
      const { room }: { room: Room } = roomService.create(fakePlayer1, 'my-super-room');
      roomService.addPlayer(fakePlayer2, room.id);
      roomService.addPlayer(fakePlayer3, room.id);
      gameService.start(fakePlayer1);
      socketService.gameOver.mockClear();
      socketService.endGame.mockClear();
      gameService.gameOver(fakePlayer1);
      expect(socketService.gameOver.mock.calls.length).toBe(1);
      expect(socketService.endGame.mock.calls.length).toBe(0);
    });
  });

  describe('updatePlayerGame', () => {
    it('should fail because player is not in room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      expect(() => gameService.updatePlayerGame(fakePlayer)).toThrow(
        new EventException('Player is not in any gaming room')
      );
    });

    it('should fail because player is in waiting room', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.addPlayerToWaitingRoom(fakePlayer);
      expect(() => gameService.updatePlayerGame(fakePlayer)).toThrow(
        new EventException('Player is not in any gaming room')
      );
    });

    it('should fail because game has not started', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      socketService.updatePlayerGame.mockClear();
      gameService.updatePlayerGame(fakePlayer);
      expect(socketService.updatePlayerGame.mock.calls.length).toBe(0);
    });

    it('should work but not attack because deletedLines is not provided', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      gameService.start(fakePlayer);
      socketService.updatePlayerGame.mockClear();
      socketService.attack.mockClear();
      gameService.updatePlayerGame(fakePlayer);
      expect(socketService.updatePlayerGame.mock.calls.length).toBe(1);
      expect(socketService.attack.mock.calls.length).toBe(0);
    });

    it('should work but not attack because only one lines has been deleted', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      gameService.start(fakePlayer);
      socketService.updatePlayerGame.mockClear();
      socketService.attack.mockClear();
      gameService.updatePlayerGame(fakePlayer, undefined, undefined, 1);
      expect(socketService.updatePlayerGame.mock.calls.length).toBe(1);
      expect(socketService.attack.mock.calls.length).toBe(0);
    });

    it('should work and attack', async () => {
      const fakePlayer: Player = Player.create('mysuperuser', 'socket-id');
      roomService.create(fakePlayer, 'my-super-room');
      gameService.start(fakePlayer);
      socketService.updatePlayerGame.mockClear();
      socketService.attack.mockClear();
      gameService.updatePlayerGame(fakePlayer, undefined, undefined, 3);
      expect(socketService.updatePlayerGame.mock.calls.length).toBe(1);
      expect(socketService.attack.mock.calls.length).toBe(1);
    });
  });
});
