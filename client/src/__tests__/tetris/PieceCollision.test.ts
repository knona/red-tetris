import { Piece } from '../../models/Piece';
import { PieceDirection } from '../../models/PieceDirection';
import { PieceType } from '../../models/PieceType';
import { Playfield } from '../../models/Playfield';
import { checkCollision, checkOverlapping, checkPieceInBuffer } from '../../tetris/PieceCollision';
import { move, moveUp } from '../../tetris/PieceMovement';
import { putPiece } from '../../tetris/PlayfieldTransformations';
import { EMPTY_PLAYFIELD } from '../../utils/constants';
import tests from '../../utils/tests';

describe('PieceCollision', () => {
  describe('collision', () => {
    it('should detect left wall collision', () => {
      let piece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(4, () => {
        piece = move(PieceDirection.left, piece);
      });
      const hasLeftCollision: boolean = checkCollision(PieceDirection.left, piece, EMPTY_PLAYFIELD);
      expect(hasLeftCollision).toBeTruthy();
    });

    it('should detect right wall collision', () => {
      let piece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(4, () => {
        piece = move(PieceDirection.right, piece);
      });
      const hasRightCollision: boolean = checkCollision(PieceDirection.right, piece, EMPTY_PLAYFIELD);
      expect(hasRightCollision).toBeTruthy();
    });

    it('should detect bottom wall collision', () => {
      let piece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(18, () => (piece = move(PieceDirection.down, piece)));
      const hasBottomCollision: boolean = checkCollision(PieceDirection.down, piece, EMPTY_PLAYFIELD);
      expect(hasBottomCollision).toBeTruthy();
    });

    it('should detect left piece collision', () => {
      let playfield: Playfield = EMPTY_PLAYFIELD;
      let staticPiece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(2, () => (staticPiece = move(PieceDirection.left, staticPiece)));
      playfield = putPiece(staticPiece, playfield).playfield;

      const piece: Piece = tests.testPiece(PieceType.O);
      const hasLeftCollision: boolean = checkCollision(PieceDirection.left, piece, playfield);
      expect(hasLeftCollision).toBeTruthy();
    });

    it('should detect right piece collision', () => {
      let playfield: Playfield = EMPTY_PLAYFIELD;
      let staticPiece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(2, () => (staticPiece = move(PieceDirection.right, staticPiece)));
      playfield = putPiece(staticPiece, playfield).playfield;

      const piece: Piece = tests.testPiece(PieceType.O);
      const hasRightCollision: boolean = checkCollision(PieceDirection.right, piece, playfield);
      expect(hasRightCollision).toBeTruthy();
    });

    it('should detect bottom piece collision', () => {
      let playfield: Playfield = EMPTY_PLAYFIELD;
      let staticPiece: Piece = tests.testPiece(PieceType.O);
      tests.repeat(2, () => (staticPiece = move(PieceDirection.down, staticPiece)));
      playfield = putPiece(staticPiece, playfield).playfield;

      const piece: Piece = tests.testPiece(PieceType.O);
      const hasDownCollision: boolean = checkCollision(PieceDirection.down, piece, playfield);
      expect(hasDownCollision).toBeTruthy();
    });
  });

  describe('overlap', () => {
    it('should detect overlap', () => {
      let playfield: Playfield = EMPTY_PLAYFIELD;
      let staticPiece: Piece = tests.testPiece(PieceType.O);
      staticPiece = move(PieceDirection.down, staticPiece);
      playfield = putPiece(staticPiece, playfield).playfield;

      const piece: Piece = tests.testPiece(PieceType.O);
      const isOverlapping: boolean = checkOverlapping(piece, playfield);
      expect(isOverlapping).toBeTruthy();
    });
  });

  describe('buffer', () => {
    it('should detect buffer overlap', () => {
      let piece: Piece = tests.testPiece(PieceType.O);
      piece = moveUp(piece);
      const isInBuffer: boolean = checkPieceInBuffer(piece);
      expect(isInBuffer).toBeTruthy();
    });
  });
});
