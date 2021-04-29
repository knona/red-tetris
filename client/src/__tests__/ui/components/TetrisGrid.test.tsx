import { RenderResult, screen } from '@testing-library/react';
import { Piece } from '../../../models/Piece';
import { PieceType } from '../../../models/PieceType';
import { Optional } from '../../../shared/Types';
import { playfieldPosition } from '../../../tetris/PiecePosition';
import { TetrisGridOverlay } from '../../../ui/components/tetrisGrid/models/TetrisGridOverlay';
import { TetrisGrid } from '../../../ui/components/tetrisGrid/TetrisGrid';
import { EMPTY_PLAYFIELD } from '../../../utils/constants';
import tests from '../../../utils/tests';
import { act, render } from '../../../utils/testsRender';

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

describe('TetrisGrid', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('piece', () => {
    it('should display the piece', async () => {
      const piece: Piece = tests.testPiece(PieceType.O);
      const pieceColor: string = 'rgb(255, 206, 0)';
      await act(async () => {
        component = render(<TetrisGrid piece={piece} playfield={EMPTY_PLAYFIELD} lockTimer={0} />);
      });
      const cells: HTMLElement[] = playfieldPosition(piece).map(point =>
        screen.getByTestId(`tetris_grid_cell_${point.x}${point.y}`)
      );
      cells.forEach(cell => expect(cell.style.backgroundColor).toEqual(pieceColor));
    });
  });

  describe('overlay', () => {
    it('should display the game over overlay', async () => {
      const piece: Piece = tests.testPiece(PieceType.O);
      await act(async () => {
        component = render(
          <TetrisGrid piece={piece} playfield={EMPTY_PLAYFIELD} lockTimer={0} overlay={TetrisGridOverlay.gameOver} />
        );
      });
      const gameOverOverlay: HTMLElement = screen.getByTestId('game_over');
      expect(gameOverOverlay).toBeInTheDocument();
    });

    it('should display the empty player overlay', async () => {
      const piece: Piece = tests.testPiece(PieceType.O);
      await act(async () => {
        component = render(
          <TetrisGrid piece={piece} playfield={EMPTY_PLAYFIELD} lockTimer={0} overlay={TetrisGridOverlay.emptyPlayer} />
        );
      });
      const emptyPlayerOverlay: HTMLElement = screen.getByTestId('empty_player');
      expect(emptyPlayerOverlay).toBeInTheDocument();
    });
  });
});
