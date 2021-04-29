import { createMemoryHistory, History } from 'history';
import { of } from 'rxjs';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import { emit$ } from '../../../shared/Socket';
import { Optional } from '../../../shared/Types';
import { RoomCreationPage } from '../../../ui/pages/roomCreation/RoomCreationPage';
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

describe('RoomCreationPage', () => {
  afterEach(() => {
    component?.unmount();
    jest.resetAllMocks();
  });

  describe('valid room name', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: tests.testGamingRoom() }));
    });

    it('should redirect to room', async () => {
      const history: History = createMemoryHistory();
      await act(async () => {
        component = render(<RoomCreationPage />, {
          initialState: {
            player: { player: tests.testPlayer() },
            rooms: {
              waitingRoom: tests.testWaitingRoom(),
              rooms: []
            },
            tetris: initialTetrisState
          },
          history: history
        });
      });
      const roomNameInput: HTMLElement = screen.getByTestId('Room Name');
      const createButton: HTMLElement = screen.getByTestId('Create');
      await act(async () => {
        fireEvent.change(roomNameInput, { target: { value: 'testroom' } });
        fireEvent.click(createButton);
      });
      expect(history.location.pathname).toEqual('/');
    });
  });

  describe('invalid room name', () => {
    it('should display an error message', async () => {
      await act(async () => {
        render(<RoomCreationPage />);
      });
      const roomNameInput: HTMLElement = screen.getByTestId('Room Name');
      const createButton: HTMLElement = screen.getByTestId('Create');
      await act(async () => {
        fireEvent.change(roomNameInput, { target: { value: 'rm' } });
        fireEvent.click(createButton);
      });
      expect(screen.getByTestId('invalid_room_name')).toBeInTheDocument();
    });
  });

  describe('cancel', () => {
    it('should redirect to rooms', async () => {
      const history: History = createMemoryHistory();
      await act(async () => {
        render(<RoomCreationPage />, { history: history });
      });
      const cancelButton: HTMLElement = screen.getByTestId('Cancel');
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      expect(history.location.pathname).toEqual('/rooms');
    });
  });
});
