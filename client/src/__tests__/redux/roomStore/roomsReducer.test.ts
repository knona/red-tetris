import { Game } from '../../../models/Game';
import { GameStatus } from '../../../models/GameStatus';
import { GamingRoom } from '../../../models/GamingRoom';
import { Player } from '../../../models/Player';
import { Room } from '../../../models/Room';
import { RoomsState } from '../../../redux/roomsStore/roomsState';
import roomsActions, { roomsReducer } from '../../../redux/roomsStore/roomsStore';
import tests from '../../../utils/tests';

jest.mock('socket.io-client', () => ({
  ...jest.requireActual('socket.io-client'),
  io: jest.fn(() => ({
    on: (): void => {
      return;
    },
    emit: (): void => {
      return;
    }
  }))
}));

describe('Rooms Reducer', () => {
  describe('setWaitingRoom', () => {
    it('should set the waiting room', () => {
      const fakeWaitingRoom: Room = tests.testWaitingRoom();
      expect(
        roomsReducer(
          undefined,
          roomsActions.setWaitingRoom({
            room: fakeWaitingRoom
          })
        ).waitingRoom
      ).toEqual(fakeWaitingRoom);
    });
  });

  describe('setRooms', () => {
    it('should set rooms', () => {
      const fakeRooms: GamingRoom[] = [tests.testGamingRoom()];
      expect(roomsReducer(undefined, roomsActions.setRooms({ rooms: fakeRooms })).rooms).toEqual(fakeRooms);
    });
  });

  describe('addRoom', () => {
    it('should add room', () => {
      const fakeRoom: GamingRoom = tests.testGamingRoom();
      expect(roomsReducer(undefined, roomsActions.addRoom({ room: fakeRoom })).rooms).toEqual([fakeRoom]);
    });

    it('should replace the waiting room if it has the same id', () => {
      const currentWaitingRoom: Room = tests.testWaitingRoom({ players: [] });
      const newWaitingRoom: GamingRoom = tests.testGamingRoom({
        id: currentWaitingRoom.id,
        player: tests.testPlayer()
      });
      const initialState: RoomsState = {
        waitingRoom: currentWaitingRoom,
        rooms: []
      };
      expect(roomsReducer(initialState, roomsActions.addRoom({ room: newWaitingRoom })).waitingRoom?.nbPlayers).toEqual(
        1
      );
    });
  });

  describe('removeRoom', () => {
    it('should remove room', () => {
      const roomNotToRemove: GamingRoom = tests.testGamingRoom({ id: 'room_not_to_remove' });
      const roomToRemove: GamingRoom = tests.testGamingRoom({ id: 'room_to_remove' });
      const initialState: RoomsState = {
        rooms: [roomNotToRemove, roomToRemove]
      };
      expect(roomsReducer(initialState, roomsActions.removeRoom({ room: roomToRemove })).rooms).toEqual([
        roomNotToRemove
      ]);
    });
  });

  describe('addPlayerToRoom', () => {
    it('should add player to the waiting room', () => {
      const existingPlayer: Player = tests.testPlayer();
      const playerToAdd: Player = tests.testPlayer('player_to_add');
      const waitingRoom: Room = tests.testWaitingRoom({ players: [existingPlayer] });
      const initialState: RoomsState = {
        waitingRoom: waitingRoom,
        rooms: []
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.addPlayerToRoom({
          room: { id: waitingRoom.id, nbPlayers: 2 },
          player: playerToAdd
        })
      );
      expect(roomState.waitingRoom?.players).toEqual([existingPlayer, playerToAdd]);
      expect(roomState.waitingRoom?.nbPlayers).toEqual(2);
    });

    it('should add player to a gaming room', () => {
      const existingRoom: GamingRoom = tests.testGamingRoom({ id: 'existing_room' });
      const playerToAdd: Player = tests.testPlayer('player_to_add');
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.addPlayerToRoom({
          room: { id: existingRoom.id, nbPlayers: existingRoom.nbPlayers + 1 },
          player: playerToAdd
        })
      );
      expect(roomState.rooms[0].players).toEqual([existingRoom.players[0], playerToAdd]);
      expect(roomState.rooms[0].nbPlayers).toEqual(2);
    });

    it('should not add the same player twice to a gaming room', () => {
      const playerToAdd: Player = tests.testPlayer();
      const existingRoom: GamingRoom = tests.testGamingRoom({ player: playerToAdd });
      const initialState: RoomsState = {
        rooms: [existingRoom]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.addPlayerToRoom({
          room: { id: existingRoom.id, nbPlayers: 1 },
          player: playerToAdd
        })
      );
      expect(roomState.rooms[0].players).toEqual([playerToAdd]);
      expect(roomState.rooms[0].nbPlayers).toEqual(1);
    });
  });

  describe('removePlayerFromRoom', () => {
    it('should remove player from the waiting room', () => {
      const playerToRemove: Player = tests.testPlayer('player_to_remove');
      const waitingRoom: Room = tests.testWaitingRoom({ players: [playerToRemove] });
      const initialState: RoomsState = {
        waitingRoom: waitingRoom,
        rooms: []
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.removePlayerFromRoom({
          room: { id: waitingRoom.id, nbPlayers: 0 },
          player: playerToRemove
        })
      );
      expect(roomState.waitingRoom?.players).toEqual([]);
      expect(roomState.waitingRoom?.nbPlayers).toEqual(0);
    });

    it('should remove player from a gaming room', () => {
      const playerToRemove: Player = tests.testPlayer();
      const existingRoom: GamingRoom = tests.testGamingRoom({ id: 'existing_room', player: playerToRemove });
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.removePlayerFromRoom({
          room: { id: existingRoom.id, nbPlayers: existingRoom.nbPlayers - 1 },
          player: playerToRemove
        })
      );
      expect(roomState.rooms[0].players).toEqual([]);
      expect(roomState.rooms[0].nbPlayers).toEqual(0);
    });
  });

  describe('changeRoomManager', () => {
    it('should set the rooms accroding to the changes', () => {
      const newPlayerManager: Player = tests.testPlayer('new_manager');
      const existingRoom: GamingRoom = tests.testGamingRoom({ id: 'existing_room' });
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.changeRoomManager({ room: { id: existingRoom.id, managerId: newPlayerManager.id } })
      );
      expect(roomState.rooms[0].managerId).toEqual(newPlayerManager.id);
    });
  });

  describe('gameStarted', () => {
    it('should set the game property', () => {
      const newGame: Game = tests.testGame({ status: GameStatus.started });
      const existingRoom: GamingRoom = tests.testGamingRoom({ id: 'existing_room' });
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.gameStarted({ room: { id: existingRoom.id, game: newGame } })
      );
      expect(roomState.rooms[0].game).toEqual(newGame);
    });
  });

  describe('playerLost', () => {
    it('should put the alive player to the losers', () => {
      const gameOverPlayer: Player = tests.testPlayer('game_over_player');
      const game: Game = tests.testGame({ playerIds: [gameOverPlayer.id] });
      const existingRoom: GamingRoom = tests.testGamingRoom({
        id: 'existing_room',
        players: [gameOverPlayer],
        game: game
      });
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.playerLost({
          room: { id: existingRoom.id, game: { aliveIds: [], loserIds: [gameOverPlayer.id] } }
        })
      );
      expect(roomState.rooms[0].game.aliveIds).toEqual([]);
      expect(roomState.rooms[0].game.loserIds).toEqual([gameOverPlayer.id]);
    });
  });

  describe('gameEnded', () => {
    it('should set the game property', () => {
      const gameOverPlayer: Player = tests.testPlayer('game_over_player');
      const currentGame: Game = tests.testGame({ status: GameStatus.started, playerIds: [gameOverPlayer.id] });
      const newGame: Game = tests.testGame({ status: GameStatus.finished });
      const existingRoom: GamingRoom = tests.testGamingRoom({ id: 'existing_room', game: currentGame });
      const initialState: RoomsState = {
        rooms: [existingRoom, tests.testGamingRoom()]
      };
      const roomState: RoomsState = roomsReducer(
        initialState,
        roomsActions.gameEnded({ room: { id: existingRoom.id, game: newGame } })
      );
      expect(roomState.rooms[0].game.aliveIds.length).toEqual(0);
      expect(roomState.rooms[0].game.loserIds).toEqual([gameOverPlayer.id]);
    });
  });
});
