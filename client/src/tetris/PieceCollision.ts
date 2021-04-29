import { Piece } from '../models/Piece';
import { PieceDirection } from '../models/PieceDirection';
import { Playfield } from '../models/Playfield';
import { PLAYFIELD_HEIGHT, PLAYFIELD_VISIBLE_HEIGHT, PLAYFIELD_WIDTH } from '../utils/constants';
import { playfieldPosition } from './PiecePosition';

export function checkCollision(direction: PieceDirection, piece: Piece, playfield: Playfield): boolean {
  switch (direction) {
    case PieceDirection.down:
      return checkCollisionDown(piece, playfield);
    case PieceDirection.left:
      return checkCollisionLeft(piece, playfield);
    case PieceDirection.right:
      return checkCollisionRight(piece, playfield);
  }
}

function checkCollisionDown(piece: Piece, playfield: Playfield): boolean {
  return playfieldPosition(piece).some(
    point => point.y === PLAYFIELD_HEIGHT - 1 || playfield[point.y + 1][point.x] !== ''
  );
}

function checkCollisionLeft(piece: Piece, playfield: Playfield): boolean {
  return playfieldPosition(piece).some(point => point.x === 0 || playfield[point.y][point.x - 1] !== '');
}

function checkCollisionRight(piece: Piece, playfield: Playfield): boolean {
  return playfieldPosition(piece).some(
    point => point.x === PLAYFIELD_WIDTH - 1 || playfield[point.y][point.x + 1] !== ''
  );
}

export function checkOverlapping(piece: Piece, playfield: Playfield): boolean {
  return playfieldPosition(piece).some(point => playfield[point.y][point.x] !== '');
}

export function checkPieceInBuffer(piece: Piece): boolean {
  return piece.points.some(point => piece.point.y + point.y > PLAYFIELD_VISIBLE_HEIGHT);
}
