import { of } from 'rxjs';
import { connectionEpic } from '../../../redux/playerStore/playerEpic';
import playerEpicActions from '../../../redux/playerStore/playerEpicActions';
import playerActions from '../../../redux/playerStore/playerStore';
import { emit$ } from '../../../shared/Socket';
import tests from '../../../utils/tests';

jest.mock('../../../shared/Socket.ts', () => ({
  ...jest.requireActual('../../../shared/Socket.ts'),
  emit$: jest.fn()
}));

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

describe('Player epic', () => {
  beforeEach(() => {
    const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
    mockedDependency.mockReturnValue(of({ player: tests.testPlayer(), room: tests.testWaitingRoom() }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('connectionEpic', () => {
    it('should return the proper store action', done => {
      connectionEpic(of(playerEpicActions.connection({ username: 'bpisano' }))).subscribe({
        next: action => {
          expect(action.type).toEqual(playerActions.setPlayer.type);
          done();
        }
      });
    });
  });
});
