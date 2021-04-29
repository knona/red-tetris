import { act, fireEvent, RenderResult, screen } from '@testing-library/react';
import { of, throwError } from 'rxjs';
import { emit$ } from '../../../shared/Socket';
import { Optional } from '../../../shared/Types';
import { RoomCommands } from '../../../ui/pages/room/roomCommands/RoomCommands';
import tests from '../../../utils/tests';
import { render } from '../../../utils/testsRender';

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

describe('Room commands', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('not joined', () => {
    beforeEach(() => {
      (emit$ as jest.Mock<any, any>).mockReturnValue(of({}));
    });

    it('should be able to join a room', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={false} isManager={false} />);
      });
      const joinButton: HTMLElement = screen.getByTestId('Join');
      expect(joinButton).toBeInTheDocument();
    });

    it('should not be able to start a game', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={false} />);
      });
      const startButton: HTMLElement | null = screen.queryByTestId('Start');
      expect(startButton).toBeNull();
    });
  });

  describe('joined', () => {
    beforeEach(() => {
      (emit$ as jest.Mock<any, any>).mockReturnValue(of({}));
    });

    it('should be able to leave a room', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={false} />);
      });
      const leaveButton: HTMLElement = screen.getByTestId('Leave');
      expect(leaveButton).toBeInTheDocument();
    });

    it('should not be able to start a game', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={false} />);
      });
      const startButton: HTMLElement | null = screen.queryByTestId('Start');
      expect(startButton).toBeNull();
    });
  });

  describe('manager', () => {
    beforeEach(() => {
      (emit$ as jest.Mock<any, any>).mockReturnValue(of({}));
    });

    it('should be able to start the game', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={true} />);
      });
      const startButton: HTMLElement = screen.getByTestId('Start');
      expect(startButton).toBeInTheDocument();
    });

    it('should be able to leave a room', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={true} />);
      });
      const leaveButton: HTMLElement = screen.getByTestId('Leave');
      expect(leaveButton).toBeInTheDocument();
    });

    it('should be able to delete the room', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={true} />);
      });
      const deleteButton: HTMLElement = screen.getByTestId('Delete room');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('error', () => {
    beforeEach(() => {
      (emit$ as jest.Mock<any, any>).mockReturnValue(throwError({ error: 'failed' }));
    });

    it('should display an error message if it failed to join', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={false} isManager={false} />);
      });
      const joinButton: HTMLElement = screen.getByTestId('Join');
      await act(async () => {
        fireEvent.click(joinButton);
      });
      expect(screen.getByTestId('failed_to_join_error')).toBeInTheDocument();
    });

    it('should display an error message if it failed to leave', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={false} />);
      });
      const leaveButton: HTMLElement = screen.getByTestId('Leave');
      await act(async () => {
        fireEvent.click(leaveButton);
      });
      expect(screen.getByTestId('failed_to_leave_error')).toBeInTheDocument();
    });

    it('should display an error message if it failed to delete the room', async () => {
      await act(async () => {
        component = render(<RoomCommands room={tests.testGamingRoom()} hasJoined={true} isManager={true} />);
      });
      const deleteButton: HTMLElement = screen.getByTestId('Delete room');
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      expect(screen.getByTestId('failed_to_delete_error')).toBeInTheDocument();
    });
  });
});
