import { act, RenderResult, screen } from '@testing-library/react';
import { Optional } from '../../../shared/Types';
import { EmptyContent } from '../../../ui/components/emptyContent/EmptyContent';
import { render } from '../../../utils/testsRender';

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

describe('Empty content', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('action', () => {
    it('should display a button', async () => {
      await act(async () => {
        component = render(
          <EmptyContent
            title="Empty Content"
            action={{
              title: 'Action',
              onPerform: (): void => {
                return;
              }
            }}
          />
        );
      });
      expect(screen.getByTestId('Action')).toBeInTheDocument();
    });
  });

  describe('no action', () => {
    it('should not display an action', async () => {
      await act(async () => {
        component = render(<EmptyContent title="Empty Content" />);
      });
      expect(screen.queryByTestId('Action')).toBeNull();
    });
  });
});
