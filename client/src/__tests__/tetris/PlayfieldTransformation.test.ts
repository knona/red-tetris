import { Piece } from '../../models/Piece';
import { PieceDirection } from '../../models/PieceDirection';
import { PieceRotation } from '../../models/PieceRotation';
import { AllPieceType, PieceType } from '../../models/PieceType';
import { Playfield } from '../../models/Playfield';
import { hardDrop, rotate } from '../../tetris/PieceMovement';
import { playfieldPosition } from '../../tetris/PiecePosition';
import { addGarbageLines, putPiece } from '../../tetris/PlayfieldTransformations';
import { EMPTY_PLAYFIELD, PLAYFIELD_WIDTH } from '../../utils/constants';
import tests from '../../utils/tests';

describe('PlayfieldTransformation', () => {
  describe('putPiece', () => {
    AllPieceType.forEach(pieceType => {
      it('should put a piece', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const playfield: Playfield = putPiece(piece, EMPTY_PLAYFIELD).playfield;
        playfieldPosition(piece).forEach(point => {
          expect(playfield[point.y][point.x]).toEqual(pieceType);
        });
      });
    });

    it('should clear completed lines', () => {
      let playfield: Playfield = EMPTY_PLAYFIELD;
      let deletedLines: number = 0;

      for (let index: number = 0; index < PLAYFIELD_WIDTH; index++) {
        let piece: Piece = tests.testPiece(PieceType.I);
        piece = rotate(PieceRotation.left, piece, playfield);
        piece = tests.moveMax(PieceDirection.right, piece, playfield);
        piece = tests.moveMax(PieceDirection.down, piece, playfield);
        piece = tests.moveMax(PieceDirection.left, piece, playfield);
        const data: { playfield: Playfield; deletedLines: number } = putPiece(piece, playfield);
        playfield = data.playfield;
        deletedLines = data.deletedLines;
      }

      playfield.flatMap(row => row).forEach(pieceType => expect(pieceType).toEqual(''));
      expect(deletedLines).toEqual(4);
    });
  });

  describe('addGarbageLines', () => {
    it('should add garbage lines', () => {
      const playfield: Playfield = EMPTY_PLAYFIELD;
      let piece: Piece = tests.testPiece(PieceType.O);
      piece = hardDrop(piece, playfield);
      const data: { piece: Piece; playfield: Playfield; isGameOver: boolean } = addGarbageLines(piece, playfield, 1);

      const holeNumber: number = data.playfield[data.playfield.length - 1].filter(pieceType => pieceType === '').length;
      expect(holeNumber).toEqual(1);
      expect(data.piece.point.y).toEqual(piece.point.y + 1);
    });
  });
});
