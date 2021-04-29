import { IsString, Validate } from 'class-validator';
import { IsExistingRoom } from './is-existing-room.validator';

export class RoomDto {
  @IsString()
  @Validate(IsExistingRoom)
  public roomId: string;
}
