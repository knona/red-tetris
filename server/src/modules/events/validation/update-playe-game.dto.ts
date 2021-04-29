import { IsNumber, IsOptional, Max, Min, Validate } from 'class-validator';
import { PieceJSON } from '../models/Piece';
import { Playfield } from '../models/Playfield';
import { IsPiece } from './is-piece.validator';
import { IsPlayfield } from './is-playfield.validator';

export class UpdatePlayerGameDto {
  @IsOptional()
  @Validate(IsPiece)
  public piece?: PieceJSON;

  @IsOptional()
  @Validate(IsPlayfield)
  public playfield?: Playfield;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  public deletedLines?: number;
}
