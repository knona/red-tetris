import { AnyAction } from 'redux';
import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, map, mapTo, mergeMap, takeUntil } from 'rxjs/operators';
import { ClientEvent, ServerEvent } from '../../shared/Events';
import { emit$, listen$ } from '../../shared/Socket';
import { observableEpic } from '../observableActions';
import tetrisActions from '../tetrisStore/tetrisStore';
import roomsEpicActions from './roomsEpicActions';
import roomsActions from './roomsStore';

export function getRoomsEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.getRooms>>
): Observable<ReturnType<typeof roomsActions.setRooms>> {
  return action$.pipe(
    filter(roomsEpicActions.getRooms.match),
    mergeMap(() => emit$(ClientEvent.getRooms)),
    map(({ rooms }) => roomsActions.setRooms({ rooms }))
  );
}

export function getRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.getRoom>>
): Observable<ReturnType<typeof roomsActions.addRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.getRoom.match),
    mergeMap(({ payload: { roomId } }) => emit$(ClientEvent.getRoom, { roomId })),
    map(({ room }) => roomsActions.addRoom({ room }))
  );
}

export function createRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.createRoom>>
): Observable<ReturnType<typeof roomsActions.addRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.createRoom.match),
    mergeMap(({ payload: { name } }) => emit$(ClientEvent.createRoom, { name })),
    map(({ room }) => roomsActions.addRoom({ room }))
  );
}

export function deleteRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.deleteRoom>>
): Observable<ReturnType<typeof roomsActions.removeRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.deleteRoom.match),
    mergeMap(({ payload: { roomId } }) => emit$(ClientEvent.deleteRoom, { roomId }).pipe(mapTo(roomId))),
    map(roomId => roomsActions.removeRoom({ room: { id: roomId } }))
  );
}

export function observeAddedRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeAddedRoom>>
): Observable<ReturnType<typeof roomsActions.addRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.observeAddedRoom.match),
    mergeMap(({ payload }) =>
      listen$(ServerEvent.roomCreated).pipe(
        map(({ room }) => roomsActions.addRoom({ room })),
        takeUntil(payload.willUnmount$)
      )
    )
  );
}

export function observeRemovedRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeRemovedRoom>>
): Observable<ReturnType<typeof roomsActions.removeRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.observeRemovedRoom.match),
    mergeMap(({ payload }) =>
      listen$(ServerEvent.roomDeleted).pipe(
        filter(response => (payload.roomId ? payload.roomId === response.room.id : true)),
        map(response => roomsActions.removeRoom({ room: { id: response.room.id } })),
        takeUntil(payload.willUnmount$)
      )
    )
  );
}

export function observePlayerAddedToRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observePlayerAddedToRoom>>
): Observable<ReturnType<typeof roomsActions.addPlayerToRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.observePlayerAddedToRoom.match),
    mergeMap(({ payload }) =>
      listen$(ServerEvent.playerJoined).pipe(
        filter(response => response.room.id === payload.roomId),
        map(response => roomsActions.addPlayerToRoom(response)),
        takeUntil(payload.willUnmount$)
      )
    )
  );
}

export function observePlayerRemovedFromRoomEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observePlayerRemovedFromRoom>>
): Observable<ReturnType<typeof roomsActions.removePlayerFromRoom>> {
  return action$.pipe(
    filter(roomsEpicActions.observePlayerRemovedFromRoom.match),
    mergeMap(action =>
      listen$(ServerEvent.playerLeft).pipe(
        filter(response => response.room.id === action.payload.roomId),
        map(response => roomsActions.removePlayerFromRoom(response)),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

export function observeRoomManagerChangesEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeRoomManagerChanges>>
): Observable<ReturnType<typeof roomsActions.changeRoomManager>> {
  return action$.pipe(
    filter(roomsEpicActions.observeRoomManagerChanges.match),
    mergeMap(action =>
      listen$(ServerEvent.roomManagerChanged).pipe(
        filter(response => response.room.id === action.payload.roomId),
        map(response => roomsActions.changeRoomManager(response)),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

export function observeGameStartEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeRoomGameStart>>
): Observable<ReturnType<typeof roomsActions.gameStarted> | ReturnType<typeof tetrisActions.start>> {
  return action$.pipe(
    filter(roomsEpicActions.observeRoomGameStart.match),
    mergeMap(action =>
      listen$(ServerEvent.gameStart).pipe(
        filter(response => response.room.id === action.payload.roomId),
        mergeMap(response => [tetrisActions.start(response.pieces), roomsActions.gameStarted(response)]),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

export function observeGameOverEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeRoomGameOver>>
): Observable<ReturnType<typeof roomsActions.playerLost>> {
  return action$.pipe(
    filter(roomsEpicActions.observeRoomGameOver.match),
    mergeMap(action =>
      listen$(ServerEvent.gameOver).pipe(
        filter(response => response.room.id === action.payload.roomId),
        map(response => roomsActions.playerLost(response)),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

export function observeGameEndEpic(
  action$: Observable<ReturnType<typeof roomsEpicActions.observeRoomGameOver>>
): Observable<ReturnType<typeof roomsActions.gameEnded>> {
  return action$.pipe(
    filter(roomsEpicActions.observeRoomGameEnd.match),
    mergeMap(action =>
      listen$(ServerEvent.gameEnd).pipe(
        filter(response => response.room.id === action.payload.roomId),
        map(response => roomsActions.gameEnded(response)),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

export const roomsEpic: (action$: Observable<AnyAction>) => Observable<any> = combineEpics(
  observableEpic(getRoomsEpic, roomsEpicActions.getRoomsSuccess, roomsEpicActions.getRoomsFailure),
  observableEpic(getRoomEpic, roomsEpicActions.getRoomSuccess, roomsEpicActions.getRoomFailure),
  observableEpic(createRoomEpic, roomsEpicActions.createRoomSuccess, roomsEpicActions.createRoomFailure),
  observableEpic(deleteRoomEpic, roomsEpicActions.deleteRoomSuccess, roomsEpicActions.deleteRoomFailure),
  observeAddedRoomEpic,
  observeRemovedRoomEpic,
  observePlayerAddedToRoomEpic,
  observePlayerRemovedFromRoomEpic,
  observeRoomManagerChangesEpic,
  observeGameStartEpic,
  observeGameOverEpic,
  observeGameEndEpic
);
