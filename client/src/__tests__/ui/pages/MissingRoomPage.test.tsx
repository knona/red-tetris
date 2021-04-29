import { History, createMemoryHistory } from 'history';
import { Optional } from '../../../shared/Types';
import { MissingRoomPage } from '../../../ui/pages/missingRoom/MissingRoomPage';
import { act, fireEvent, render, RenderResult, screen } from '../../../utils/testsRender';

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

describe('MissingRoomPage', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('ok', () => {
    it('should redirect to rooms', async () => {
      const history: History = createMemoryHistory();
      await act(async () => {
        component = render(<MissingRoomPage />, { history: history });
      });
      const okButton: HTMLElement = screen.getByTestId('OK');
      await act(async () => {
        fireEvent.click(okButton);
      });
      expect(history.location.pathname).toEqual('/rooms');
    });
  });
});
