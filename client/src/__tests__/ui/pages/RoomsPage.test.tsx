import { act, RenderResult, screen } from '@testing-library/react';
import { of } from 'rxjs';
import { emit$ } from '../../../shared/Socket';
import { Optional } from '../../../shared/Types';
import { RoomsPage } from '../../../ui/pages/rooms/RoomsPage';
import Test from '../../../utils/tests';
import { render } from '../../../utils/testsRender';

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

describe('Rooms page', () => {
  afterEach(() => {
    component?.unmount();
    jest.resetAllMocks();
  });

  describe('UI', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: Test.testGamingRoom(), rooms: [Test.testGamingRoom()] }));
    });

    it('should display the rooms and the waiting room', async () => {
      await act(async () => {
        component = render(<RoomsPage waitingRoom={Test.testWaitingRoom()} />);
      });
      const waitingRoom: HTMLElement = screen.getByTestId('waiting_room');
      const roomList: HTMLElement = screen.getByTestId('room_list');
      expect(waitingRoom).toBeInTheDocument();
      expect(roomList).toBeInTheDocument();
    });
  });
});
