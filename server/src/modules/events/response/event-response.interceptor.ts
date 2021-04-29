import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventResponse } from './event-response.interface';

@Injectable()
export class EventResponseInterceptor<T> implements NestInterceptor<T, EventResponse> {
  public intercept(_context: ExecutionContext, next: CallHandler): Observable<EventResponse> {
    return next.handle().pipe(
      map(data => {
        const response: EventResponse = {
          status: 'success',
          message: 'success'
        };
        if (data) {
          response.data = data;
        }
        return response;
      })
    );
  }
}
