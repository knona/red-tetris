import { of, throwError } from 'rxjs';
import { emit$ } from '../../../shared/Socket';
import { Optional } from '../../../shared/Types';
import { PlayerCreationPage } from '../../../ui/pages/playerCreation/PlayerCreationPage';
import tests from '../../../utils/tests';
import { act, fireEvent, render, RenderResult, screen } from '../../../utils/testsRender';

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

let component: Optional<RenderResult>;

describe('PlayerCreationPage', () => {
  afterEach(() => {
    component?.unmount();
    jest.resetAllMocks();
  });

  describe('valid username', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ player: tests.testPlayer(), room: tests.testWaitingRoom() }));
    });

    it('should create the player', async () => {
      const playerCreated: jest.Mock<any, any> = jest.fn();
      await act(async () => {
        component = render(<PlayerCreationPage onPlayerCreated={playerCreated} />);
      });
      const usernameInput: HTMLElement = screen.getByTestId('Username');
      const playButton: HTMLElement = screen.getByTestId('Play');
      fireEvent.change(usernameInput, { target: { value: 'bpisano' } });
      fireEvent.click(playButton);
      expect(playerCreated.call.length).toEqual(1);
    });
  });

  describe('invalid username', () => {
    it('should display an error message', async () => {
      await act(async () => {
        render(
          <PlayerCreationPage
            onPlayerCreated={(): void => {
              return;
            }}
          />
        );
      });
      const usernameInput: HTMLElement = screen.getByTestId('Username');
      const playButton: HTMLElement = screen.getByTestId('Play');
      fireEvent.change(usernameInput, { target: { value: 'bp' } });
      fireEvent.click(playButton);
      expect(screen.getByTestId('invalid_username_error')).toBeInTheDocument();
    });
  });

  describe('error', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(throwError({ error: 'Failed to create player' }));
    });

    it('should display an error message', async () => {
      await act(async () => {
        component = render(
          <PlayerCreationPage
            onPlayerCreated={(): void => {
              return;
            }}
          />
        );
      });
      const usernameInput: HTMLElement = screen.getByTestId('Username');
      const playButton: HTMLElement = screen.getByTestId('Play');
      fireEvent.change(usernameInput, { target: { value: 'bpisano' } });
      await act(async () => {
        fireEvent.click(playButton);
      });
      expect(screen.getByTestId('failed_to_create_player_error')).toBeInTheDocument();
    });
  });
});
