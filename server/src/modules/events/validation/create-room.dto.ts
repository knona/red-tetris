import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @Matches('^[a-zA-Z0-9 ]{3,40}$')
  public name: string;
}
