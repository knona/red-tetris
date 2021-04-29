import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { WsExceptionFilter } from '@nestjs/common/interfaces';
import { isFunction, isObject, isString } from '@nestjs/common/utils/shared.utils';
import { WsException } from '@nestjs/websockets';
import * as dayjs from 'dayjs';
import { EventResponse } from '../response/event-response.interface';
import { EventException } from './event.exception';

function logError(exception: WsException | any): void {
  const logger: Logger = new Logger();
  logger.error(`Error catched ${dayjs().format('HH:mm:ss')} -----`);
  if (exception?.message) {
    logger.error(exception.message);
  }
  if (exception.getError && isFunction(exception.getError)) {
    logger.error(exception.getError());
  }
  logger.error('-----------------');
}

@Catch()
export class EventExceptionsFilter implements WsExceptionFilter {
  public catch(exception: unknown | any, host: ArgumentsHost): void {
    logError(exception);

    host.switchToWs();

    const errorResponse: EventResponse = {
      status: 'error',
      message: 'An error occurred'
    };

    if (exception instanceof WsException) {
      const error: string | object = exception.getError();
      if (isString(error)) {
        errorResponse.message = error;
      } else if (isObject(error)) {
        if (exception instanceof EventException) {
          const { message, data }: { message: string; data: any } = error as { message: string; data: any };
          errorResponse.message = message;
          if (data) {
            errorResponse.error = data;
          }
        }
      }
    }

    const ackCallback: (error: any) => void = host.getArgByIndex(2) ?? host.getArgByIndex(1);
    if (isFunction(ackCallback)) {
      ackCallback(errorResponse);
    }
  }
}
