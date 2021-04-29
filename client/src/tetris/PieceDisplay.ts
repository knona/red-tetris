import { Piece } from '../models/Piece';
import { Playfield } from '../models/Playfield';
import { arePointsEqual, Point } from '../models/Point';
import { Optional } from '../shared/Types';
import {
  PIECE_BACKGROUND_COLOR,
  PIECE_BORDER_OPACITY,
  PIECE_BORDER_RATIO,
  TETRIS_LOCK_INTERVAL
} from '../utils/constants';
import { playfieldPosition } from './PiecePosition';

enum CellType {
  default = 'default',
  putPiece = 'putPiece',
  piece = 'piece',
  pieceGhost = 'pieceGhost',
  garbage = 'garbage'
}

export function cellType(cellPosition: Point, playfield: Playfield, piece?: Piece, pieceGhost?: Piece): CellType {
  const isGarbage: boolean = playfield[cellPosition.y][cellPosition.x] === 'X';
  if (isGarbage) {
    return CellType.garbage;
  }
  if (piece) {
    const isPiece: boolean = playfieldPosition(piece).some(point => arePointsEqual(point, cellPosition));
    if (isPiece) {
      return CellType.piece;
    }
  }
  if (pieceGhost) {
    const isPieceGhost: boolean = playfieldPosition(pieceGhost).some(point => arePointsEqual(point, cellPosition));
    if (isPieceGhost) {
      return CellType.pieceGhost;
    }
  }
  const isPutPiece: boolean = playfield[cellPosition.y][cellPosition.x] !== '';
  if (isPutPiece) {
    return CellType.putPiece;
  }
  return CellType.default;
}

export function cellBackgroundColor(
  cellPosition: Point,
  playfield: Playfield,
  piece?: Piece,
  pieceGhost?: Piece
): Optional<string> {
  switch (cellType(cellPosition, playfield, piece, pieceGhost)) {
    case CellType.garbage:
    case CellType.putPiece:
      return PIECE_BACKGROUND_COLOR[playfield[cellPosition.y][cellPosition.x]];
    case CellType.piece:
      return piece ? PIECE_BACKGROUND_COLOR[piece.type] : undefined;
    case CellType.pieceGhost:
      return pieceGhost ? PIECE_BACKGROUND_COLOR[pieceGhost.type] : undefined;
    default:
      return undefined;
  }
}

export function cellBorderColor(
  cellPosition: Point,
  cellRatio: number,
  playfield: Playfield,
  piece?: Piece,
  pieceGhost?: Piece
): Optional<string> {
  const borderSize: number = cellRatio * PIECE_BORDER_RATIO;
  const border: string = `solid ${borderSize}px rgba(0, 0, 0, ${PIECE_BORDER_OPACITY})`;
  if (cellType(cellPosition, playfield, piece, pieceGhost) !== CellType.default) {
    return border;
  }
  return undefined;
}

export function cellOpacity(
  cellPosition: Point,
  playfield: Playfield,
  lockTimer: number,
  piece?: Piece,
  pieceGhost?: Piece
): number {
  const halfLockInterval: number = TETRIS_LOCK_INTERVAL / 2;
  switch (cellType(cellPosition, playfield, piece, pieceGhost)) {
    case CellType.pieceGhost:
      return 0.4;
    case CellType.piece:
      return lockTimer === -1 ? 1 : Math.abs(lockTimer - halfLockInterval) / halfLockInterval;
    default:
      return 1;
  }
}
