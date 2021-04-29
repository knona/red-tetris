import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { BACK_URL } from '../utils/constants';
import { ClientEvent, ClientEventParameters, ServerEvent, ServerEventResponses } from './Events';

type RawSocketData<T> = { status: 'success' | 'error'; message: string; data?: T; error?: any };

const socket: Socket = io(BACK_URL);

const isConnectedSubject$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
export const isConnected$: Observable<boolean> = isConnectedSubject$.asObservable();

socket.on('connect', () => {
  isConnectedSubject$.next(true);
});

socket.on('disconnect', () => {
  isConnectedSubject$.next(false);
});

function fromSocketEvent$<T>(event: string): Observable<T> {
  return new Observable<T>((subscriber: Subscriber<T>) => {
    socket.on(event, (data: T) => subscriber.next(data));
  });
}

export function listen$<T extends ServerEvent>(event: T): Observable<ServerEventResponses[T]> {
  return fromSocketEvent$<ServerEventResponses[T]>(event).pipe(
    map((data: ServerEventResponses[T]) => {
      return data as ServerEventResponses[T];
    })
  );
}

function fromSocketEmit$<T>(event: string, dataToSend?: object): Observable<RawSocketData<T>> {
  return new Observable<RawSocketData<T>>((subscriber: Subscriber<RawSocketData<T>>) => {
    socket.emit(event, dataToSend, (data: RawSocketData<T>) => {
      subscriber.next(data);
      subscriber.complete();
    });
  });
}

export function emit$<T extends ClientEvent>(
  event: T,
  dataToSend?: ClientEventParameters[T]['arguments']
): Observable<ClientEventParameters[T]['response']> {
  return fromSocketEmit$<ClientEventParameters[T]['response']>(event, dataToSend).pipe(
    map(({ data, message, status, error }: RawSocketData<ClientEventParameters[T]['response']>) => {
      if (status === 'error') {
        throw { message, data: error, socketServerError: true };
      }
      return data;
    })
  );
}
