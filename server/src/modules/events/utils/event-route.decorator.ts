import { applyDecorators, SetMetadata } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';

export function EventRoute(eventName: string): ReturnType<typeof applyDecorators> {
  return applyDecorators(SetMetadata('event-name', eventName), SubscribeMessage(eventName));
}
