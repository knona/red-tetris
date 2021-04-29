import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { PieceType } from '../models/Piece';
import { PLAYFIELD_HEIGTH, PLAYFIELD_WIDTH } from '../models/Playfield';

@ValidatorConstraint({ name: 'IsPlayfield', async: false })
@Injectable()
export class IsPlayfield implements ValidatorConstraintInterface {
  public validate(playfield: any): boolean {
    if (!Array.isArray(playfield) || playfield.length !== PLAYFIELD_HEIGTH) {
      return false;
    }

    for (const row of playfield) {
      if (!Array.isArray(row) || row.length !== PLAYFIELD_WIDTH) {
        return false;
      }
    }

    for (const row of playfield) {
      for (const cell of row) {
        if (cell !== '' && cell !== 'X' && Object.values(PieceType).every(type => type !== cell)) {
          return false;
        }
      }
    }

    return true;
  }

  public defaultMessage(): string {
    return 'Playfield is not valid';
  }
}
