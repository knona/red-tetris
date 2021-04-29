import { Socket } from 'socket.io-client';

type RawSocketData<T> = { status: 'success' | 'error'; message: string; data?: T; error?: any };

export function emit<T>(socket: Socket, event: string, dataToSend?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, dataToSend, ({ status, message, data, error }: RawSocketData<T>) => {
      if (status === 'error') {
        reject({ message, data: error });
      } else {
        resolve(data as T);
      }
    });
  });
}
