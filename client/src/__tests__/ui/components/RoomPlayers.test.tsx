import { act, RenderResult, screen } from '@testing-library/react';
import { GamingRoom } from '../../../models/GamingRoom';
import { Optional } from '../../../shared/Types';
import { RoomPlayers } from '../../../ui/pages/room/roomPlayers/RoomPlayers';
import { render } from '../../../utils/testsRender';
import tests from '../../../utils/tests';

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

describe('Room players', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('with players', () => {
    it('should display no player', async () => {
      const gamingRoom: GamingRoom = tests.testGamingRoom();
      await act(async () => {
        render(<RoomPlayers room={gamingRoom} />);
      });
      expect(screen.getAllByTestId('player_row').length).toEqual(1);
    });
  });
});
