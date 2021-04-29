import playerSelectors from '../../../redux/playerStore/playerSelectors';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import tests from '../../../utils/tests';

describe('Player selector', () => {
  describe('getPlayer', () => {
    it('should return the current player', () => {
      expect(
        playerSelectors.getPlayer({
          player: {
            player: tests.testPlayer()
          },
          rooms: {
            rooms: []
          },
          tetris: initialTetrisState
        })
      ).toEqual(tests.testPlayer());
    });
  });
});
