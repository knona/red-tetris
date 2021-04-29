import { Player } from '../../../models/Player';
import playerActions, { playerReducer } from '../../../redux/playerStore/playerStore';
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

describe('Player Reducer', () => {
  describe('setPlayer', () => {
    it('should set the player', () => {
      const newPlayer: Player = tests.testPlayer();
      expect(playerReducer(undefined, playerActions.setPlayer({ player: newPlayer })).player).toEqual(newPlayer);
    });
  });
});
