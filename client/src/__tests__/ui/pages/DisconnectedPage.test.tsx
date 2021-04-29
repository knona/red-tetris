import { History, createMemoryHistory } from 'history';
import { Optional } from '../../../shared/Types';
import { DisconnectedPage } from '../../../ui/pages/disconnected/DisconnectedPage';
import { fireEvent, render, RenderResult, screen } from '../../../utils/testsRender';

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

describe('DisconnectedPage', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('ok', () => {
    it('should redirect to start', async () => {
      const history: History = createMemoryHistory();
      render(<DisconnectedPage />, { history: history });
      const okButton: HTMLElement = screen.getByTestId('OK');
      fireEvent.click(okButton);
      expect(history.location.pathname).toEqual('/');
    });
  });
});
