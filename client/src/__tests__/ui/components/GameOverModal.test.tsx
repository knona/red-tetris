import { fireEvent, RenderResult, screen } from '@testing-library/react';
import { Player } from '../../../models/Player';
import { Optional } from '../../../shared/Types';
import { GameOverModal } from '../../../ui/pages/game/GameOverModal/GameOverModal';
import { render, act } from '../../../utils/testsRender';
import { GamingRoom } from '../../../models/GamingRoom';
import { Game } from '../../../models/Game';
import { initialPlayerState } from '../../../redux/playerStore/playerState';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import { History, createMemoryHistory } from 'history';
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

describe('GameOverModal', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('title', () => {
    it('should display win if the player wins', async () => {
      const testPlayer: Player = tests.testPlayer();
      const player: Player = tests.testPlayer('winer');
      const game: Game = tests.testGame({ players: [player, testPlayer], loserIds: [testPlayer.id, player.id] });
      const room: GamingRoom = tests.testGamingRoom({ game: game });
      await act(async () => {
        component = render(<GameOverModal player={player} room={room} />, {
          initialState: { player: initialPlayerState, rooms: { rooms: [room] }, tetris: initialTetrisState }
        });
      });
      const title: HTMLElement = screen.getByTestId('title');
      expect(title.textContent).toEqual('You win!');
    });

    it('should display game over if the player looses', async () => {
      const testPlayer: Player = tests.testPlayer();
      const player: Player = tests.testPlayer('loser');
      const game: Game = tests.testGame({ loserIds: [player.id, testPlayer.id] });
      const room: GamingRoom = tests.testGamingRoom({ players: [player, testPlayer], game: game });
      await act(async () => {
        component = render(<GameOverModal player={player} room={room} />, {
          initialState: { player: initialPlayerState, rooms: { rooms: [room] }, tetris: initialTetrisState }
        });
      });
      const title: HTMLElement = screen.getByTestId('title');
      expect(title.textContent).toEqual('Game Over');
    });
  });

  describe('actions', () => {
    it('should redirect to the room page on continue', async () => {
      const history: History = createMemoryHistory();
      const player: Player = tests.testPlayer();
      const room: GamingRoom = tests.testGamingRoom();
      await act(async () => {
        component = render(<GameOverModal player={player} room={room} />, { history: history });
      });
      const continueButton: HTMLElement = screen.getByTestId('Continue');
      await act(async () => {
        fireEvent.click(continueButton);
      });
      expect(history.location.pathname).toEqual(`/rooms/${room.id}`);
    });
  });
});
