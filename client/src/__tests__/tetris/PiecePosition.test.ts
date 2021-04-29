import zipArray from 'zip-array';
import { Piece } from '../../models/Piece';
import { AllPieceDirection, PieceDirection } from '../../models/PieceDirection';
import { AllPieceType } from '../../models/PieceType';
import { Playfield } from '../../models/Playfield';
import { arePointsEqual, Point } from '../../models/Point';
import { Size } from '../../models/Size';
import { move } from '../../tetris/PieceMovement';
import {
  bottomProjection,
  canPutPiece,
  playfieldPosition,
  setPieceInBuffer,
  topProjection
} from '../../tetris/PiecePosition';
import { putPiece } from '../../tetris/PlayfieldTransformations';
import { EMPTY_PLAYFIELD, PLAYFIELD_HEIGHT, PLAYFIELD_VISIBLE_HEIGHT } from '../../utils/constants';
import tests from '../../utils/tests';

describe('PiecePosition', () => {
  describe('playfieldPosition', () => {
    AllPieceType.forEach(pieceType => {
      it('should return an array of the piece in the playfield', () => {
        const playfieldHeight: number = PLAYFIELD_HEIGHT;
        const piece: Piece = tests.testPiece(pieceType);
        const playfieldPositionPoints: Point[] = playfieldPosition(piece, playfieldHeight);
        zipArray.zip(piece.points, playfieldPositionPoints).forEach((points: [Point, Point]) => {
          expect(points[1].x).toEqual(points[0].x + piece.point.x - 1);
          expect(points[1].y).toEqual(playfieldHeight - (points[0].y + piece.point.y));
        });
      });
    });
  });

  describe('canPutPiece', () => {
    AllPieceType.forEach(pieceType => {
      it('should be able to put the piece', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const playfeidlPiece: boolean = canPutPiece(piece, EMPTY_PLAYFIELD);
        expect(playfeidlPiece).toBeTruthy();
      });
    });

    AllPieceType.forEach(pieceType => {
      AllPieceDirection.forEach(pieceDirection => {
        it('should not be able to put the piece outside of the playfield', () => {
          let piece: Piece = tests.testPiece(pieceType);
          tests.repeat(20, () => (piece = move(pieceDirection, piece)));
          const playfieldPiece: boolean = canPutPiece(piece, EMPTY_PLAYFIELD);
          expect(playfieldPiece).not.toBeTruthy();
        });
      });
    });
  });

  describe('bottomProjection', () => {
    AllPieceType.forEach(pieceType => {
      it('should represent the bottom projection', () => {
        let movedDownPiece: Piece = tests.testPiece(pieceType);
        while (!canPutPiece(movedDownPiece, EMPTY_PLAYFIELD)) {
          movedDownPiece = move(PieceDirection.down, movedDownPiece);
        }
        const piece: Piece = tests.testPiece(pieceType);
        const pieceProjection: Piece = bottomProjection(piece, EMPTY_PLAYFIELD);
        zipArray.zip(movedDownPiece.points, pieceProjection.points).forEach((points: [Point, Point]) => {
          const pointsEquality: boolean = arePointsEqual(points[0], points[1]);
          expect(pointsEquality).toBeTruthy();
        });
      });
    });
  });

  describe('topProjection', () => {
    AllPieceType.forEach(pieceType => {
      it('should represents the top projection', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const playfield: Playfield = putPiece(piece, EMPTY_PLAYFIELD).playfield;
        const pieceProjection: Piece = topProjection(piece, playfield);
        const pieceSize: Size = tests.pieceSize(piece);
        expect(pieceProjection.point.y).toEqual(piece.point.y + pieceSize.height);
      });
    });
  });

  describe('setPieceInBuffer', () => {
    AllPieceType.forEach(pieceType => {
      it('should put the piece in the buffer', () => {
        let piece: Piece = tests.testPiece(pieceType);
        piece = setPieceInBuffer(piece);
        expect(piece.point.y).toBeGreaterThanOrEqual(PLAYFIELD_VISIBLE_HEIGHT);
      });
    });
  });
});
