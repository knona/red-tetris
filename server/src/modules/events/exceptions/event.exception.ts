import { WsException } from '@nestjs/websockets';

export class EventException extends WsException {
  public constructor(message: string, data?: any) {
    super({ message, data });
  }
}
