import { PieceType } from './PieceType';
import { Point } from './Point';

export interface Piece {
  type: PieceType;
  point: Point;
  points: Point[];
  rotation: number;
}

export function generatePiece(type: PieceType, point?: Point): Piece {
  let points: [Point, Point, Point, Point];
  const rotation: number = 0;

  /* prettier-ignore */
  switch (type) {
    case PieceType.I:
      if (!point) {
        point = { x: 5.5, y: 18.5 };
      }
      points = [{ x: -1.5, y: 0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }];
      break;
    case PieceType.O:
      if (!point) {
        point = { x: 5.5, y: 19.5 };
      }
      points = [{ x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }];
      break;
    case PieceType.T:
      points = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }];
      break;
    case PieceType.S:
      points = [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }];
      break;
    case PieceType.Z:
      points = [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }];
      break;
    case PieceType.J:
      points = [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }];
      break;
    case PieceType.L:
      points = [{ x: 1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }];
      break;
  }
  return { type, point: point ?? { x: 5, y: 19 }, points, rotation };
}
