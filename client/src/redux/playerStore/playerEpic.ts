import { combineEpics } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';
import { ClientEvent } from '../../shared/Events';
import { emit$ } from '../../shared/Socket';
import roomsActions from '../roomsStore/roomsStore';
import { StoreState } from '../state';
import playerEpicActions from './playerEpicActions';
import playerActions from './playerStore';

export function connectionEpic(
  action$: Observable<ReturnType<typeof playerEpicActions.connection>>
): Observable<ReturnType<typeof playerActions.setPlayer> | ReturnType<typeof roomsActions.setWaitingRoom>> {
  return action$.pipe(
    filter(playerEpicActions.connection.match),
    mergeMap(({ payload: { username } }) => emit$(ClientEvent.connection, { username })),
    mergeMap(({ player, room }) => [
      playerActions.setPlayer({ player }),
      roomsActions.setWaitingRoom({ room }),
      playerEpicActions.connectionSuccess(null)
    ]),
    catchError(err => {
      return of(playerEpicActions.connectionFailure(err));
    })
  );
}

export const playerEpic: (action$: Observable<any>, state$: Observable<StoreState>) => Observable<any> = combineEpics(
  connectionEpic
);
