import { of } from 'rxjs';
import { emit$ } from '../../../shared/Socket';
import { Optional } from '../../../shared/Types';
import { WaitingRoom } from '../../../ui/pages/rooms/waitingRoom/WaitingRoom';
import tests from '../../../utils/tests';
import { act, render, RenderResult, screen } from '../../../utils/testsRender';

let component: Optional<RenderResult>;

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

describe('WaitingRoom', () => {
  beforeEach(() => {
    const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
    mockedDependency.mockReturnValue(of({ room: tests.testWaitingRoom() }));
  });

  afterEach(() => {
    component?.unmount();
    jest.resetAllMocks();
  });

  it('should display players', async () => {
    await act(async () => {
      component = render(<WaitingRoom waitingRoom={tests.testWaitingRoom()} />);
    });
    expect(screen.getAllByTestId('player_row').length).toEqual(1);
    expect(screen.getAllByTestId('player_row_username')[0].textContent).toEqual(tests.testPlayer().username);
  });

  it('should display a message if there is no players', async () => {
    await act(async () => {
      render(<WaitingRoom waitingRoom={tests.testWaitingRoom({ players: [] })} />);
    });
    expect(screen.getByTestId('waiting_room_no_player_message')).toBeInTheDocument();
  });
});
