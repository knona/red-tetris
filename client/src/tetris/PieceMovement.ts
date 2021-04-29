import { Piece } from '../models/Piece';
import { PieceDirection } from '../models/PieceDirection';
import { PieceRotation } from '../models/PieceRotation';
import { PieceType } from '../models/PieceType';
import { Playfield } from '../models/Playfield';
import { Point } from '../models/Point';
import { bottomProjection, canPutPiece } from './PiecePosition';

export function translate(piece: Piece, point: Point): Piece {
  return { ...piece, point: { x: piece.point.x + point.x, y: piece.point.y + point.y } };
}

export function move(moveDirection: PieceDirection, piece: Piece): Piece {
  switch (moveDirection) {
    case PieceDirection.down:
      return moveDown(piece);
    case PieceDirection.left:
      return moveLeft(piece);
    case PieceDirection.right:
      return moveRight(piece);
  }
}

export function moveUp(piece: Piece): Piece {
  return translate(piece, { x: 0, y: 1 });
}

export function moveDown(piece: Piece): Piece {
  return translate(piece, { x: 0, y: -1 });
}

export function moveLeft(piece: Piece): Piece {
  return translate(piece, { x: -1, y: 0 });
}

export function moveRight(piece: Piece): Piece {
  return translate(piece, { x: 1, y: 0 });
}

function rotateLeft(piece: Piece, playfield: Playfield): Piece {
  if (piece.type === PieceType.O) {
    return piece;
  }

  const rotatedPiece: Piece = {
    ...piece,
    rotation: (piece.rotation - 1 + 4) % 4,
    points: piece.points.map(point => ({ x: -point.y, y: point.x }))
  };
  if (canPutPiece(rotatedPiece, playfield)) {
    return rotatedPiece;
  }

  let wallKickData: { [key: string]: [Point, Point, Point, Point] };
  if (piece.type !== PieceType.I) {
    /* prettier-ignore */
    wallKickData = {
      '1->0': [{ x: +1, y: +0 }, { x: +1, y: -1 }, { x: +0, y: +2 }, { x: +1, y: +2 }],
      '2->1': [{ x: -1, y: +0 }, { x: -1, y: +1 }, { x: +0, y: -2 }, { x: -1, y: -2 }],
      '3->2': [{ x: -1, y: +0 }, { x: -1, y: -1 }, { x: +0, y: +2 }, { x: -1, y: +2 }],
      '0->3': [{ x: +1, y: +0 }, { x: +1, y: +1 }, { x: +0, y: -2 }, { x: +1, y: -2 }]
    }
  } else {
    /* prettier-ignore */
    wallKickData = {
      '1->0': [{ x: +2, y: +0 }, { x: -1, y: +0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
      '2->1': [{ x: +1, y: +0 }, { x: -2, y: +0 }, { x: +1, y: -2 }, { x: -2, y: +1 }],
      '3->2': [{ x: -2, y: +0 }, { x: +1, y: +0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
      '0->3': [{ x: -1, y: +0 }, { x: +2, y: +0 }, { x: -1, y: +2 }, { x: +2, y: -1 }]
    }
  }

  for (const translationPoint of wallKickData[`${piece.rotation}->${rotatedPiece.rotation}`]) {
    const translatedPiece: Piece = translate(rotatedPiece, translationPoint);
    if (canPutPiece(translatedPiece, playfield)) {
      return translatedPiece;
    }
  }
  return piece;
}

function rotateRight(piece: Piece, playfield: Playfield): Piece {
  if (piece.type === PieceType.O) {
    return piece;
  }

  const rotatedPiece: Piece = {
    ...piece,
    rotation: (piece.rotation + 1) % 4,
    points: piece.points.map(point => ({ x: point.y, y: -point.x }))
  };
  if (canPutPiece(rotatedPiece, playfield)) {
    return rotatedPiece;
  }

  let wallKickData: { [key: string]: [Point, Point, Point, Point] };
  if (piece.type !== PieceType.I) {
    /* prettier-ignore */
    wallKickData = {
      '0->1': [{ x: -1, y: +0 }, { x: -1, y: +1 }, { x: +0, y: -2 }, { x: -1, y: -2 }],
      '1->2': [{ x: +1, y: +0 }, { x: +1, y: -1 }, { x: +0, y: +2 }, { x: +1, y: +2 }],
      '2->3': [{ x: +1, y: +0 }, { x: +1, y: +1 }, { x: +0, y: -2 }, { x: +1, y: -2 }],
      '3->0': [{ x: -1, y: +0 }, { x: -1, y: -1 }, { x: +0, y: +2 }, { x: -1, y: +2 }]
    }
  } else {
    /* prettier-ignore */
    wallKickData = {
      '0->1': [{ x: -2, y: +0 }, { x: +1, y: +0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
      '1->2': [{ x: -1, y: +0 }, { x: +2, y: +0 }, { x: -1, y: +2 }, { x: +2, y: -1 }],
      '2->3': [{ x: +2, y: +0 }, { x: -1, y: +0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
      '3->0': [{ x: +1, y: +0 }, { x: -2, y: +0 }, { x: +1, y: -2 }, { x: -2, y: +1 }]
    }
  }

  for (const translationPoint of wallKickData[`${piece.rotation}->${rotatedPiece.rotation}`]) {
    const translatedPiece: Piece = translate(rotatedPiece, translationPoint);
    if (canPutPiece(translatedPiece, playfield)) {
      return translatedPiece;
    }
  }
  return piece;
}

export function rotate(rotationDirection: PieceRotation, piece: Piece, playfield: Playfield): Piece {
  switch (rotationDirection) {
    case PieceRotation.left:
      return rotateLeft(piece, playfield);
    case PieceRotation.right:
      return rotateRight(piece, playfield);
  }
}

export function hardDrop(piece: Piece, playfield: Playfield): Piece {
  return bottomProjection(piece, playfield);
}
