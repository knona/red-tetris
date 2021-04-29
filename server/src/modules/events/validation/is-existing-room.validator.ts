import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { RoomService } from '../room.service';

@ValidatorConstraint({ name: 'IsExistingRoom', async: false })
@Injectable()
export class IsExistingRoom implements ValidatorConstraintInterface {
  public constructor(private roomService: RoomService) {}

  public validate(roomId: string): boolean {
    return this.roomService.isExistingRoom(roomId);
  }

  public defaultMessage(): string {
    return 'Room does not exist';
  }
}
