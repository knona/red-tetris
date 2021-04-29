import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { NotConnectedGuard } from './not-connected.guard';

export function NotConnected(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(NotConnectedGuard), SetMetadata('is-public', true));
}
