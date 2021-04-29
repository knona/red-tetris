import { act, fireEvent, render, RenderResult, screen } from '../../../utils/testsRender';
import { RoomList } from '../../../ui/pages/rooms/roomList/RoomList';
import { Optional } from '../../../shared/Types';
import { emit$ } from '../../../shared/Socket';
import { of, throwError } from 'rxjs';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import { History, createMemoryHistory } from 'history';
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

let component: Optional<RenderResult>;

describe('RoomList', () => {
  afterEach(() => {
    component?.unmount();
    jest.resetAllMocks();
  });

  describe('no rooms', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ rooms: [] }));
    });

    it('should display a no room message', async () => {
      await act(async () => {
        component = render(<RoomList />);
      });
      expect(screen.getByTestId('No rooms')).toBeInTheDocument();
    });
  });

  describe('rooms', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ rooms: [tests.testGamingRoom()] }));
    });

    it('should display rooms', async () => {
      await act(async () => {
        component = render(<RoomList />, {
          initialState: {
            player: {},
            rooms: {
              rooms: [tests.testGamingRoom()]
            },
            tetris: initialTetrisState
          }
        });
      });
      expect(screen.getAllByTestId('room_row_name')[0].textContent).toEqual(tests.testGamingRoom().name);
      expect(screen.getAllByTestId('room_row').length).toEqual(1);
    });
  });

  describe('acions', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ rooms: [] }));
    });

    it('should redirect to room creation', async () => {
      const history: History = createMemoryHistory();
      await act(async () => {
        component = render(<RoomList />, { history: history });
      });
      const newRoomButton: HTMLElement = screen.getByTestId('New');
      await act(async () => {
        fireEvent.click(newRoomButton);
      });
      expect(history.location.pathname).toEqual('/createRoom');
    });
  });

  describe('error', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(throwError({ error: 'Failed to get rooms' }));
    });

    it('should display an error message', async () => {
      await act(async () => {
        component = render(<RoomList />);
      });
      expect(screen.getByTestId('failed_to_fetch_rooms_error')).toBeInTheDocument();
    });
  });
});
