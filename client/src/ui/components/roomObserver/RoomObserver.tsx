import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Subject } from 'rxjs';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import { Component } from '../../../shared/Types';
import { RoomObserverAction } from './models/RoomObserverAction';
import { RoomObserverProps } from './RoomObserverProps';

export function RoomObserver(props: RoomObserverProps): Component {
  const dispatch: Dispatch<AnyAction> = useDispatch();

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    if (props.actions.includes(RoomObserverAction.addedRoom)) {
      dispatch(roomsEpicActions.observeAddedRoom({ willUnmount$ }));
    }
    if (props.actions.includes(RoomObserverAction.removedRoom)) {
      dispatch(roomsEpicActions.observeRemovedRoom({ willUnmount$ }));
    }
    if (props.roomId) {
      if (props.actions.includes(RoomObserverAction.playerAddedToRoom)) {
        dispatch(roomsEpicActions.observePlayerAddedToRoom({ roomId: props.roomId, willUnmount$ }));
      }
      if (props.actions.includes(RoomObserverAction.playerRemovedFromRoom)) {
        dispatch(roomsEpicActions.observePlayerRemovedFromRoom({ roomId: props.roomId, willUnmount$ }));
      }
      if (props.actions.includes(RoomObserverAction.roomGameStart)) {
        dispatch(roomsEpicActions.observeRoomGameStart({ roomId: props.roomId, willUnmount$ }));
      }
      if (props.actions.includes(RoomObserverAction.roomGameOver)) {
        dispatch(roomsEpicActions.observeRoomGameOver({ roomId: props.roomId, willUnmount$ }));
      }
      if (props.actions.includes(RoomObserverAction.roomGameEnd)) {
        dispatch(roomsEpicActions.observeRoomGameEnd({ roomId: props.roomId, willUnmount$ }));
      }
    }
  }, []);

  return props.children;
}
