import { Piece } from '../models/Piece';
import { PieceDirection } from '../models/PieceDirection';
import { Playfield } from '../models/Playfield';
import { Point } from '../models/Point';
import { PLAYFIELD_HEIGHT, PLAYFIELD_VISIBLE_HEIGHT, PLAYFIELD_WIDTH } from '../utils/constants';
import { checkCollision, checkOverlapping } from './PieceCollision';
import { moveDown, moveUp } from './PieceMovement';

export function playfieldPosition(piece: Piece, height: number = PLAYFIELD_HEIGHT): Point[] {
  return piece.points.map(point => ({
    x: point.x + piece.point.x - 1,
    y: height - (point.y + piece.point.y)
  }));
}

export function canPutPiece(piece: Piece, playfield: Playfield): boolean {
  return playfieldPosition(piece).every(
    point =>
      point.y >= 0 &&
      point.y < PLAYFIELD_HEIGHT &&
      point.x >= 0 &&
      point.x < PLAYFIELD_WIDTH &&
      playfield[point.y][point.x] === ''
  );
}

export function bottomProjection(piece: Piece, playfield: Playfield): Piece {
  let translatedPiece: Piece = piece;
  while (!checkCollision(PieceDirection.down, translatedPiece, playfield)) {
    translatedPiece = moveDown(translatedPiece);
  }
  return translatedPiece;
}

export function topProjection(piece: Piece, playfield: Playfield): Piece {
  let translatedPiece: Piece = piece;
  while (checkOverlapping(translatedPiece, playfield)) {
    translatedPiece = moveUp(translatedPiece);
  }
  return translatedPiece;
}

export function setPieceInBuffer(piece: Piece): Piece {
  let translatedPiece: Piece = piece;
  while (translatedPiece.points.some(point => translatedPiece.point.y + point.y <= PLAYFIELD_VISIBLE_HEIGHT)) {
    translatedPiece = moveUp(translatedPiece);
  }
  return translatedPiece;
}
