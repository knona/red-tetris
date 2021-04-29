import { act, fireEvent, RenderResult, screen } from '@testing-library/react';
import { Optional } from '../../../shared/Types';
import { OnboardingPage } from '../../../ui/pages/onboarding/OnboardingPage';
import { render } from '../../../utils/testsRender';
import { History, createMemoryHistory } from 'history';

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

describe('Onboarding page', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('start button', () => {
    it('should redirect to player creation', async () => {
      const history: History = createMemoryHistory();
      await act(async () => {
        render(<OnboardingPage />, { history: history });
      });
      const startButton: HTMLElement = screen.getByTestId('Start');
      fireEvent.click(startButton);
      expect(history.location.pathname).toEqual('/createPlayer');
    });
  });
});
