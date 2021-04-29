import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { Subject } from 'rxjs';
import { createObservableAction, ObservableActionCreator } from '../observableActions';

const getRoomsFailure: ActionCreatorWithPayload<any> = createAction('epic:rooms/getRoomsFailure');
const getRoomsSuccess: ActionCreatorWithPayload<any> = createAction('epic:rooms/getRoomsSuccess');
const getRooms: ObservableActionCreator = createObservableAction('epic:rooms/getRooms', {
  successType: getRoomsSuccess.type,
  errorType: getRoomsFailure.type
});

const getRoomSuccess: ActionCreatorWithPayload<any> = createAction('epic:rooms/getRoomSuccess');
const getRoomFailure: ActionCreatorWithPayload<any> = createAction('epic:rooms/getRoomFailure');
const getRoom: ObservableActionCreator<{ roomId: string }> = createObservableAction('epic:rooms/getRoom', {
  successType: getRoomSuccess.type,
  errorType: getRoomFailure.type
});

const createRoomSuccess: ActionCreatorWithPayload<any> = createAction('epic:rooms/createRoomSuccess');
const createRoomFailure: ActionCreatorWithPayload<any> = createAction('epic:rooms/createRoomFailure');
const createRoom: ObservableActionCreator<{ name: string }> = createObservableAction('epic:rooms/createRoom', {
  successType: createRoomSuccess.type,
  errorType: createRoomFailure.type
});

const deleteRoomSuccess: ActionCreatorWithPayload<any> = createAction('epic:rooms/deleteRoomSuccess');
const deleteRoomFailure: ActionCreatorWithPayload<any> = createAction('epic:rooms/deleteRoomFailure');
const deleteRoom: ObservableActionCreator<{ roomId: string }> = createObservableAction('epic:rooms/deleteRoom', {
  successType: deleteRoomSuccess.type,
  errorType: deleteRoomFailure.type
});

const observeAddedRoom: ActionCreatorWithPayload<{ willUnmount$: Subject<void> }> = createAction(
  'epic:rooms/observeAddedRoom'
);

const observeRemovedRoom: ActionCreatorWithPayload<{ willUnmount$: Subject<void>; roomId?: string }> = createAction(
  'epic:rooms/observeRemovedRoom'
);

const observePlayerAddedToRoom: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observePlayerAddedToRoom');

const observePlayerRemovedFromRoom: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observePlayerRemovedFromRoom');

const observeRoomManagerChanges: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observeRoomManagerChanges');

const observeRoomGameStart: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observeRoomGameStart');

const observeRoomGameOver: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observeRoomGameOver');

const observeRoomGameEnd: ActionCreatorWithPayload<{
  roomId: string;
  willUnmount$: Subject<void>;
}> = createAction('epic:rooms/observeRoomGameEnd');

export default {
  getRoomsFailure,
  getRoomsSuccess,
  getRooms,
  getRoomSuccess,
  getRoomFailure,
  getRoom,
  createRoomSuccess,
  createRoomFailure,
  createRoom,
  deleteRoomSuccess,
  deleteRoomFailure,
  deleteRoom,
  observeAddedRoom,
  observeRemovedRoom,
  observePlayerAddedToRoom,
  observePlayerRemovedFromRoom,
  observeRoomManagerChanges,
  observeRoomGameStart,
  observeRoomGameOver,
  observeRoomGameEnd
};
