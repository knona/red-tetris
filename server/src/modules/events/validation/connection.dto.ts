import { IsString, IsAlphanumeric, MinLength, MaxLength } from 'class-validator';

export class ConnectionDto {
  @IsString()
  @IsAlphanumeric()
  @MinLength(3)
  @MaxLength(20)
  public username: string;
}
