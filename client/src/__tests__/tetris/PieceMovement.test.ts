import zipArray from 'zip-array';
import { Piece } from '../../models/Piece';
import { PieceDirection } from '../../models/PieceDirection';
import { AllPieceRotations, PieceRotation } from '../../models/PieceRotation';
import { AllPieceType, PieceType } from '../../models/PieceType';
import { Playfield } from '../../models/Playfield';
import { Point } from '../../models/Point';
import { hardDrop, move, moveUp, rotate } from '../../tetris/PieceMovement';
import { canPutPiece } from '../../tetris/PiecePosition';
import { putPiece } from '../../tetris/PlayfieldTransformations';
import { EMPTY_PLAYFIELD } from '../../utils/constants';
import tests from '../../utils/tests';

describe('PieceMovement', () => {
  describe('translations', () => {
    AllPieceType.forEach(pieceType => {
      it('should move the piece down', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const movedDownPiece: Piece = move(PieceDirection.down, piece);
        expect(movedDownPiece.point.y).toEqual(piece.point.y - 1);
      });
    });

    AllPieceType.forEach(pieceType => {
      it('should move the piece left', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const movedDownPiece: Piece = move(PieceDirection.left, piece);
        expect(movedDownPiece.point.x).toEqual(piece.point.x - 1);
      });
    });

    AllPieceType.forEach(pieceType => {
      it('should move the piece right', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const movedDownPiece: Piece = move(PieceDirection.right, piece);
        expect(movedDownPiece.point.x).toEqual(piece.point.x + 1);
      });
    });

    AllPieceType.forEach(pieceType => {
      it('should move the piece up', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const movedDownPiece: Piece = moveUp(piece);
        expect(movedDownPiece.point.y).toEqual(piece.point.y + 1);
      });
    });
  });

  describe('rotations', () => {
    AllPieceType.filter(pieceType => pieceType !== PieceType.O).forEach(pieceType => {
      it('should rotate the piece left', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const rotatedPiece: Piece = rotate(PieceRotation.left, piece, EMPTY_PLAYFIELD);
        zipArray.zip(piece.points, rotatedPiece.points).forEach((points: [Point, Point]) => {
          expect(points[1].x).toEqual(-points[0].y);
          expect(points[1].y).toEqual(points[0].x);
        });
        expect(rotatedPiece.rotation).toEqual((piece.rotation - 1 + 4) % 4);
      });
    });

    AllPieceType.filter(pieceType => pieceType !== PieceType.O).forEach(pieceType => {
      it('should rotate the piece right', () => {
        const piece: Piece = tests.testPiece(pieceType);
        const rotatedPiece: Piece = rotate(PieceRotation.right, piece, EMPTY_PLAYFIELD);
        zipArray.zip(piece.points, rotatedPiece.points).forEach((points: [Point, Point]) => {
          expect(points[1].x).toEqual(points[0].y);
          expect(points[1].y).toEqual(-points[0].x);
        });
        expect(rotatedPiece.rotation).toEqual((piece.rotation + 1 + 4) % 4);
      });
    });

    AllPieceRotations.forEach(rotation => {
      it('should rotate the piece (O)', () => {
        const piece: Piece = tests.testPiece(PieceType.O);
        const rotatedPiece: Piece = rotate(rotation, piece, EMPTY_PLAYFIELD);
        expect(rotatedPiece).toEqual(piece);
      });
    });

    AllPieceType.filter(pieceType => pieceType !== PieceType.O).forEach(pieceType => {
      AllPieceRotations.forEach(rotation => {
        it('should wall kick', () => {
          let piece: Piece = tests.testPiece(pieceType);
          piece = rotate(PieceRotation.left, piece, EMPTY_PLAYFIELD);
          tests.repeat(4, () => {
            piece = tests.moveMax(PieceDirection.left, piece, EMPTY_PLAYFIELD);
            piece = rotate(rotation, piece, EMPTY_PLAYFIELD);
            const playfieldPiece: boolean = canPutPiece(piece, EMPTY_PLAYFIELD);
            expect(playfieldPiece).toBeTruthy();
          });
        });
      });
    });

    AllPieceRotations.forEach(rotation => {
      it('should not wall kick if the piece is blocked', () => {
        let playfield: Playfield = EMPTY_PLAYFIELD;

        let piece1: Piece = tests.testPiece(PieceType.I);
        piece1 = rotate(PieceRotation.left, piece1, playfield);
        piece1 = tests.moveMax(PieceDirection.left, piece1, playfield);
        piece1 = hardDrop(piece1, playfield);

        let piece2: Piece = tests.testPiece(PieceType.I);
        piece2 = rotate(PieceRotation.left, piece2, playfield);
        piece2 = tests.moveMax(PieceDirection.left, piece2, playfield);
        tests.repeat(2, () => (piece2 = move(PieceDirection.right, piece2)));
        piece2 = hardDrop(piece2, playfield);

        let piece3: Piece = tests.testPiece(PieceType.I);
        piece3 = rotate(PieceRotation.left, piece3, playfield);
        piece3 = tests.moveMax(PieceDirection.left, piece3, playfield);
        piece3 = move(PieceDirection.right, piece3);
        piece3 = hardDrop(piece3, playfield);

        playfield = putPiece(piece1, playfield).playfield;
        playfield = putPiece(piece2, playfield).playfield;

        const rotatedPiece: Piece = rotate(rotation, piece3, playfield);
        expect(rotatedPiece).toEqual(piece3);
      });
    });
  });
});
