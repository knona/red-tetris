import { PieceType } from './PieceType';

export type BoxedPiece = (PieceType | '')[][];

export function newBoxedPiece(pieceType: PieceType): BoxedPiece {
  switch (pieceType) {
    case PieceType.I:
      return [[pieceType, pieceType, pieceType, pieceType]];
    case PieceType.O:
      return [
        [pieceType, pieceType],
        [pieceType, pieceType]
      ];
    case PieceType.T:
      return [
        ['', pieceType, ''],
        [pieceType, pieceType, pieceType]
      ];
    case PieceType.S:
      return [
        ['', pieceType, pieceType],
        [pieceType, pieceType, '']
      ];
    case PieceType.Z:
      return [
        [pieceType, pieceType, ''],
        ['', pieceType, pieceType]
      ];
    case PieceType.J:
      return [
        [pieceType, '', ''],
        [pieceType, pieceType, pieceType]
      ];
    case PieceType.L:
      return [
        ['', '', pieceType],
        [pieceType, pieceType, pieceType]
      ];
    default:
      throw new Error('Piece type is invalid');
  }
}
