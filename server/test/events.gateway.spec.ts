/* eslint-disable */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { io, Socket } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { EventException } from 'src/modules/events/exceptions/event.exception';
import { GameService } from 'src/modules/events/game.service';
import { Piece, PieceType } from 'src/modules/events/models/Piece';
import { Player } from 'src/modules/events/models/Player';
import { PLAYFIELD_HEIGTH, PLAYFIELD_WIDTH } from 'src/modules/events/models/Playfield';
import { Point } from 'src/modules/events/models/Point';
import { Room } from 'src/modules/events/models/Room';
import { PlayerService } from 'src/modules/events/player.service';
import { RoomService } from 'src/modules/events/room.service';
import { SocketIoAdapter } from 'src/modules/events/socket-io.adapter';
import { EmptyLogger } from './empty-logger';
import { emit } from './socket-promise';

const port = 32548;

describe('Events Gateway', () => {
  let app: INestApplication;
  let socket: Socket;
  let roomService: RoomService;
  let playerService: PlayerService;
  let gameService: GameService;
  const userNotCreatedError = { message: 'The player has not been created' };
  const userAlreadyConnectedError = { message: 'The player is already connected' };
  const roomNotExistingError = { data: { errors: ['Room does not exist'] } };
  const pieceInvalidError = { data: { errors: ['Piece is not valid'] } };
  const playfieldInvalidError = { data: { errors: ['Playfield is not valid'] } };

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useLogger(new EmptyLogger());
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.listen(port);
    roomService = await app.resolve<RoomService>(RoomService);
    playerService = await app.resolve<PlayerService>(PlayerService);
    gameService = await app.resolve<GameService>(GameService);
    socket = io(`http://localhost:${port}`);
  });

  afterEach(async () => {
    await app.close();
    socket.disconnect();
  });

  describe(':test', () => {
    it('should return the same message emitted', async () => {
      const dataToSend = { message: 'hello' };
      const response = await emit(socket, ':test', dataToSend);
      expect(response).toStrictEqual({ incoming: dataToSend });
    });
  });

  describe(':connection', () => {
    it('should not work if username length < 3', async () => {
      await expect(emit(socket, ':connection', { username: 'ha' })).rejects.toBeTruthy();
    });

    it('should not work if username length > 20', async () => {
      await expect(emit(socket, ':connection', { username: new Array(22).join('A') })).rejects.toBeTruthy();
    });

    it('should not work because username contains non-alphanumeric characters', async () => {
      await expect(emit(socket, ':connection', { username: 'hasdf!' })).rejects.toBeTruthy();
    });

    it('should not work because player already connected', async () => {
      await emit(socket, ':connection', { username: 'test' });
      await expect(emit(socket, ':connection', { username: 'test' })).rejects.toMatchObject(userAlreadyConnectedError);
    });

    it('should work and create player', async () => {
      const { player, room }: { player: Player; room: Room } = await emit(socket, ':connection', { username: 'test' });
      expect(playerService.getPlayer(socket.id).toJSON()).toStrictEqual(player);
      expect(roomService.getRoom(room.id).room.toJSON()).toStrictEqual(room);
    });
  });

  describe(':create_room', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':create_room', { name: 'test' })).rejects.toMatchObject(userNotCreatedError);
    });

    it('should fail because name contains non-alphanumeric characters', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':create_room', { name: 'myrooo%m' })).rejects.toBeTruthy();
    });

    it("should fail because name's length < 3", async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':create_room', { name: 'my' })).rejects.toBeTruthy();
    });

    it("should fail because name's length > 40", async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':create_room', { name: new Array(42).join('A') })).rejects.toBeTruthy();
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = await emit(socket, ':create_room', { name: 'test' });
      expect(roomService.getRoom(room.id).room.toJSON()).toStrictEqual(room);
    });

    it('should work even if name contains space', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = await emit(socket, ':create_room', { name: 'My Super Room' });
      expect(roomService.getRoom(room.id).room.toJSON()).toStrictEqual(room);
    });
  });

  describe(':get_room', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':get_room', { roomId: 'hola' })).rejects.toMatchObject(userNotCreatedError);
    });

    it('should fail because room does not exist', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':get_room', { roomId: 'hola' })).rejects.toMatchObject(roomNotExistingError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = await emit(socket, ':create_room', { name: 'awesomeroom' });
      expect(await emit(socket, ':get_room', { roomId: room.id })).toStrictEqual({ room });
    });
  });

  describe(':get_rooms', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':get_rooms')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should return an array which contains a room', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = await emit(socket, ':create_room', { name: 'test' });
      expect(await emit(socket, ':get_rooms', { roomId: 'hola' })).toStrictEqual({ rooms: [room] });
    });
  });

  describe(':delete_room', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':delete_room')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should not work because room does not exist', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':delete_room', { roomId: 'awesomeroom' })).rejects.toMatchObject(roomNotExistingError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = await emit(socket, ':create_room', { name: 'test' });
      await expect(emit(socket, ':delete_room', { roomId: room.id })).resolves.toBe(undefined);
    });
  });

  describe(':join_room', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':join_room')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should not work because room does not exist', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':join_room', { roomId: 'awesomeroom' })).rejects.toMatchObject(roomNotExistingError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      const { room }: { room: Room } = roomService.create(Player.create('fakeUser', 'socketId'), 'Awesoooome rooom');
      await expect(emit(socket, ':join_room', { roomId: room.id })).resolves.toBe(undefined);
    });
  });

  describe(':join_waiting_room', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':join_waiting_room')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await expect(emit(socket, ':join_waiting_room')).resolves.toBe(undefined);
      expect(playerService.getPlayer(socket.id).currentRoom).toBe(roomService.waitingRoom.id);
    });
  });

  describe('disconnection', () => {
    it('should remove player from player list', async () => {
      const { player }: { player: Player; room: Room } = await emit(socket, ':connection', { username: 'superuser' });
      socket.disconnect();
      expect(() => playerService.getPlayer(player.id)).toThrow(EventException);
    });

    it('should remove player from room', async () => {
      const { player }: { player: Player; room: Room } = await emit(socket, ':connection', { username: 'superuser' });
      socket.disconnect();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(roomService.waitingRoom.getPlayer(player.id)).toBe(undefined);
    });
  });

  describe(':start_game', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':start_game')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should start the game', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });
      await emit(socket, ':start_game');
      expect(gameService.getRoomWithStartedGame(playerService.getPlayer(socket.id))).not.toBe(undefined);
    });
  });

  describe(':next_pieces', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':next_pieces')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });
      const response = await emit(socket, ':next_pieces');
      expect(response).toBe(undefined);
    });
  });

  describe(':game_over', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':game_over')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });
      const response = await emit(socket, ':game_over');
      expect(response).toBe(undefined);
      expect(gameService.getRoomWithStartedGame(playerService.getPlayer(socket.id))).toBe(undefined);
    });
  });

  describe(':update_player_game', () => {
    it('should fail because player not connected', async () => {
      await expect(emit(socket, ':update_player_game')).rejects.toMatchObject(userNotCreatedError);
    });

    it('should fail because piece is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const piece = {};
      await expect(emit(socket, ':update_player_game', { piece })).rejects.toMatchObject(pieceInvalidError);
    });
    it('should fail because piece is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const piece = {
        rotation: 0,
        point: new Point(5, 5),
        points: [new Point(0, 1), new Point(-1, 0), new Point(0, 0), new Point(1, 0)],
        type: PieceType.L
      };
      await expect(emit(socket, ':update_player_game', { piece })).rejects.toMatchObject(pieceInvalidError);
    });
    it('should fail because piece is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const piece = {
        rotation: 0,
        point: new Point(1, 2),
        points: [new Point(1, 2), new Point(1, 2), new Point(1, 2), new Point(1, 2)],
        type: PieceType.O
      };
      await expect(emit(socket, ':update_player_game', { piece })).rejects.toMatchObject(pieceInvalidError);
    });
    it('should fail because piece is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const piece = {
        rotation: 0,
        point: new Point(35, 40),
        points: [new Point(0, 1), new Point(-1, 0), new Point(0, 0), new Point(1, 0)],
        type: PieceType.T
      };
      await expect(emit(socket, ':update_player_game', { piece })).rejects.toMatchObject(pieceInvalidError);
    });
    it('should fail because playfield is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const playfield = [];
      await expect(emit(socket, ':update_player_game', { playfield })).rejects.toMatchObject(playfieldInvalidError);
    });
    it('should fail because playfield is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const playfield = Array.from({ length: PLAYFIELD_HEIGTH }, () => new Array(PLAYFIELD_HEIGTH).fill(''));
      playfield[2][5] = 'A';
      await expect(emit(socket, ':update_player_game', { playfield })).rejects.toMatchObject(playfieldInvalidError);
    });
    it('should fail because playfield is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const playfield = Array.from({ length: PLAYFIELD_HEIGTH }, () => new Array(PLAYFIELD_HEIGTH).fill(''));
      playfield[2] = new Array(PLAYFIELD_HEIGTH + 3).fill('');
      await expect(emit(socket, ':update_player_game', { playfield })).rejects.toMatchObject(playfieldInvalidError);
    });
    it('should fail because deletedLines is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });
      await expect(emit(socket, ':update_player_game', { deletedLines: -1 })).rejects.toBeTruthy();
    });
    it('should fail because deletedLines is invalid', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });
      await expect(emit(socket, ':update_player_game', { deletedLines: 24 })).rejects.toBeTruthy();
    });
    it('should work', async () => {
      await emit(socket, ':connection', { username: 'superuser' });
      await emit(socket, ':create_room', { name: 'My Super Room' });

      const piece = Piece.generate(PieceType.S);
      const playfield = Array.from({ length: PLAYFIELD_HEIGTH }, () => new Array(PLAYFIELD_WIDTH).fill(''));
      const deletedLines = 2;
      await expect(emit(socket, ':update_player_game', { piece, playfield, deletedLines })).resolves.toBe(undefined);
    });
  });
});
