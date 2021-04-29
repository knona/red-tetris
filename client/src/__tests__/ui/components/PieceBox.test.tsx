import { RenderResult, screen } from '@testing-library/react';
import { Piece } from '../../../models/Piece';
import { Optional } from '../../../shared/Types';
import { PieceBox } from '../../../ui/components/pieceBox/PieceBox';
import { render, act } from '../../../utils/testsRender';
import { PieceType } from '../../../models/PieceType';
import { PieceBoxTitlePosition } from '../../../ui/components/pieceBox/models/PieceBoxTitlePosition';
import { BoxedPiece, newBoxedPiece } from '../../../models/BoxedPiece';
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

describe('PieceBox', () => {
  afterEach(() => {
    component?.unmount();
  });

  describe('piece', () => {
    it('should display the piece', async () => {
      const piece: Piece = tests.testPiece(PieceType.O);
      const boxedPiece: BoxedPiece = newBoxedPiece(piece.type);
      await act(async () => {
        component = render(<PieceBox title="Box" titlePosition={PieceBoxTitlePosition.left} piece={piece} />);
      });
      const cells: HTMLElement[] = boxedPiece.flatMap((row, y) =>
        row.map((_, x) => screen.getByTestId(`piece_box_grid_cell_${x}${y}`))
      );
      cells.forEach(cell => expect(cell.style.backgroundColor).toEqual('rgb(255, 206, 0)'));
    });
  });
});
