import { Game } from '../../../models/Game';
import { GamingRoom } from '../../../models/GamingRoom';
import { Player } from '../../../models/Player';
import roomsSelectors from '../../../redux/roomsStore/roomsSelectors';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import tests from '../../../utils/tests';

describe('Rooms selector', () => {
  describe('getWaitingRoom', () => {
    it('should return the waiting room', () => {
      expect(
        roomsSelectors.getWaitingRoom({
          player: {
            player: tests.testPlayer()
          },
          rooms: {
            waitingRoom: tests.testWaitingRoom(),
            rooms: []
          },
          tetris: initialTetrisState
        })
      ).toEqual(tests.testWaitingRoom());
    });
  });

  describe('getRooms', () => {
    it('should return the rooms', () => {
      expect(
        roomsSelectors.getRooms({
          player: {
            player: tests.testPlayer()
          },
          rooms: {
            rooms: [tests.testGamingRoom()]
          },
          tetris: initialTetrisState
        })
      ).toEqual([tests.testGamingRoom()]);
    });
  });

  describe('getRoomWithId', () => {
    it('should return a room with a given id', () => {
      expect(
        roomsSelectors.getRoomWithId(
          {
            player: {
              player: tests.testPlayer()
            },
            rooms: {
              rooms: [tests.testGamingRoom()]
            },
            tetris: initialTetrisState
          },
          tests.testGamingRoom().id
        )
      ).toEqual(tests.testGamingRoom());
    });
  });

  describe('getRoomGameStatus', () => {
    it('should return the current game status', () => {
      expect(
        roomsSelectors.getRoomGameStatus(
          {
            player: { player: tests.testPlayer() },
            rooms: { rooms: [tests.testGamingRoom()] },
            tetris: initialTetrisState
          },
          tests.testGamingRoom().id
        )
      ).toEqual(tests.testGamingRoom().game.status);
    });
  });

  describe('getRoomGameAlivePlayers', () => {
    it('should return the alive players', () => {
      const alivePlayer: Player = tests.testPlayer('alive_player');
      const testGame: Game = tests.testGame({ players: [alivePlayer], playerIds: [alivePlayer.id] });
      const gamingRoom: GamingRoom = tests.testGamingRoom({ game: testGame });
      expect(
        roomsSelectors.getRoomGameAlivePlayers(
          {
            player: { player: tests.testPlayer() },
            rooms: { rooms: [gamingRoom] },
            tetris: initialTetrisState
          },
          gamingRoom.id
        )
      ).toEqual([alivePlayer]);
    });
  });

  it('should return an empty array if the room does not exists', () => {
    const alivePlayer: Player = tests.testPlayer('alive_player');
    const testGame: Game = tests.testGame({ players: [alivePlayer], playerIds: [alivePlayer.id] });
    const gamingRoom: GamingRoom = tests.testGamingRoom({ game: testGame });
    expect(
      roomsSelectors.getRoomGameAlivePlayers(
        {
          player: { player: tests.testPlayer() },
          rooms: { rooms: [gamingRoom] },
          tetris: initialTetrisState
        },
        'fake_id'
      )
    ).toEqual([]);
  });

  describe('getRoomGameLosers', () => {
    it('should return the loser players', () => {
      const loserPlayer: Player = tests.testPlayer('loser_player');
      const testGame: Game = tests.testGame({ players: [loserPlayer], loserIds: [loserPlayer.id] });
      const gamingRoom: GamingRoom = tests.testGamingRoom({ game: testGame });
      expect(
        roomsSelectors.getRoomGameLosers(
          {
            player: { player: tests.testPlayer() },
            rooms: { rooms: [gamingRoom] },
            tetris: initialTetrisState
          },
          gamingRoom.id
        )
      ).toEqual([loserPlayer]);
    });
  });

  it('should return an empty array if the room does not exists', () => {
    const loserPlayer: Player = tests.testPlayer('loser_player');
    const testGame: Game = tests.testGame({ players: [loserPlayer], loserIds: [loserPlayer.id] });
    const gamingRoom: GamingRoom = tests.testGamingRoom({ game: testGame });
    expect(
      roomsSelectors.getRoomGameLosers(
        {
          player: { player: tests.testPlayer() },
          rooms: { rooms: [gamingRoom] },
          tetris: initialTetrisState
        },
        'fake_id'
      )
    ).toEqual([]);
  });
});
