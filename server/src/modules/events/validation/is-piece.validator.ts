import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Point } from '../models/Point';
import { Piece, PieceType } from '../models/Piece';
import { PLAYFIELD_HEIGTH, PLAYFIELD_WIDTH } from '../models/Playfield';

@ValidatorConstraint({ name: 'IsPiece', async: false })
@Injectable()
export class IsPiece implements ValidatorConstraintInterface {
  private isPoint(point: any): boolean {
    if (!point || typeof point !== 'object' || Object.keys(point).length !== 2) {
      return false;
    }
    if (typeof point.x !== 'number' || typeof point.y !== 'number') {
      return false;
    }
    return true;
  }

  public validate(piece: any): boolean {
    if (typeof piece !== 'object' || Object.keys(piece).length !== 4) {
      return false;
    }

    if (typeof piece.type !== 'string' || !Object.values(PieceType).some(pieceType => pieceType === piece.type)) {
      return false;
    }

    if (typeof piece.rotation !== 'number' || piece.rotation < 0 || piece.rotation > 3) {
      return false;
    }

    if (!this.isPoint(piece.point)) {
      return false;
    }

    if (!Array.isArray(piece.points) || piece.points.length !== 4 || piece.points.some(point => !this.isPoint(point))) {
      return false;
    }

    const pieceTest: Piece = Piece.generate(piece.type, new Point(piece.point.x, piece.point.y));
    for (let i: number = 0; i < piece.rotation; i++) {
      pieceTest.rotateRight();
    }

    for (const [index, point] of piece.points.entries()) {
      const absPoint: Point = new Point(point.x + piece.point.x, point.y + piece.point.y);
      if (absPoint.x < 1 || absPoint.x > PLAYFIELD_WIDTH || absPoint.y < 1 || absPoint.y > PLAYFIELD_HEIGTH) {
        return false;
      }
      if (point.x !== pieceTest.points[index].x || point.y !== pieceTest.points[index].y) {
        return false;
      }
      return true;
    }

    return true;
  }

  public defaultMessage(): string {
    return 'Piece is not valid';
  }
}
