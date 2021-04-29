import { initialPlayerState } from '../../../redux/playerStore/playerState';
import { initialRoomsState } from '../../../redux/roomsStore/roomsState';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import { Optional } from '../../../shared/Types';
import { Score } from '../../../ui/pages/game/Score/Score';
import { act, render, RenderResult, screen } from '../../../utils/testsRender';

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

let component: Optional<RenderResult>;

describe('Score', () => {
  afterEach(() => {
    component?.unmount();
  });

  it('should display the current score', async () => {
    const score: number = 500;
    await act(async () => {
      component = render(<Score />, {
        initialState: {
          player: initialPlayerState,
          rooms: initialRoomsState,
          tetris: {
            ...initialTetrisState,
            score: score
          }
        }
      });
    });
    const scoreLabel: HTMLElement = screen.getByTestId('score');
    expect(scoreLabel.textContent).toEqual(`${score}`);
  });

  it('should display the current level', async () => {
    const level: number = 2;
    await act(async () => {
      component = render(<Score />, {
        initialState: {
          player: initialPlayerState,
          rooms: initialRoomsState,
          tetris: {
            ...initialTetrisState,
            level: level
          }
        }
      });
    });
    const levelLabel: HTMLElement = screen.getByTestId('level');
    expect(levelLabel.textContent).toContain(`${level}`);
  });
});
