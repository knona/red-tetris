import { act, fireEvent, RenderResult, screen } from '@testing-library/react';
import { GamingRoom } from '../../../models/GamingRoom';
import { Optional } from '../../../shared/Types';
import { RoomRow } from '../../../ui/components/roomRow/RoomRow';
import { render } from '../../../utils/testsRender';
import { Game } from '../../../models/Game';
import { GameStatus } from '../../../models/GameStatus';
import { History, createMemoryHistory } from 'history';
import { initialPlayerState } from '../../../redux/playerStore/playerState';
import { initialRoomsState } from '../../../redux/roomsStore/roomsState';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
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

describe('RoomRow', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('UI', () => {
    it('should displays the room title', async () => {
      const room: GamingRoom = tests.testGamingRoom({ name: 'room' });
      await act(async () => {
        component = render(<RoomRow room={room} />);
      });
      const roomRowNameLabel: HTMLElement = screen.getByTestId('room_row_name');
      expect(roomRowNameLabel.textContent).toEqual(room.name);
    });

    it('should displays the number of players', async () => {
      const room: GamingRoom = tests.testGamingRoom({ name: 'room' });
      await act(async () => {
        component = render(<RoomRow room={room} />);
      });
      const nbPlayersLabel: HTMLElement = screen.getByTestId('room_row_nb_players');
      expect(nbPlayersLabel.textContent).toContain(room.nbPlayers);
    });

    it('should displays an in game indicator if the game started', async () => {
      const game: Game = tests.testGame({ status: GameStatus.started });
      const room: GamingRoom = tests.testGamingRoom({ name: 'room', game: game });
      await act(async () => {
        component = render(<RoomRow room={room} />, {
          initialState: {
            player: initialPlayerState,
            rooms: { ...initialRoomsState, rooms: [room] },
            tetris: initialTetrisState
          }
        });
      });
      const inGameIndicator: HTMLElement = screen.getByTestId('in_game');
      expect(inGameIndicator.style.opacity).toEqual('1');
    });

    it('should not displays an in game indicator if the game has not started', async () => {
      const game: Game = tests.testGame({ status: GameStatus.finished });
      const room: GamingRoom = tests.testGamingRoom({ name: 'room', game: game });
      await act(async () => {
        component = render(<RoomRow room={room} />, {
          initialState: {
            player: initialPlayerState,
            rooms: { ...initialRoomsState, rooms: [room] },
            tetris: initialTetrisState
          }
        });
      });
      const inGameIndicator: HTMLElement = screen.getByTestId('in_game');
      expect(inGameIndicator.style.opacity).toEqual('0');
    });

    it('should redirect to the room on click', async () => {
      const history: History = createMemoryHistory();
      const room: GamingRoom = tests.testGamingRoom();
      await act(async () => {
        component = render(<RoomRow room={room} />, { history: history });
      });
      const roomRow: HTMLElement = screen.getByTestId('room_row');
      await act(async () => {
        fireEvent.click(roomRow);
      });
      expect(history.location.pathname).toEqual(`/rooms/${room.id}`);
    });
  });
});
