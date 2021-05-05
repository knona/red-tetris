import { History } from 'history';
import { Dispatch, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { AnyAction } from 'redux';
import { Subject } from 'rxjs';
import { DispatchObserve } from '../../../../redux/observableActions';
import roomsEpicActions from '../../../../redux/roomsStore/roomsEpicActions';
import { ClientEvent } from '../../../../shared/Events';
import { emit$ } from '../../../../shared/Socket';
import { Component, Optional, State } from '../../../../shared/Types';
import { Box } from '../../../components/box/Box';
import { Empty } from '../../../components/empty/Empty';
import { Grid } from '../../../components/grid/Grid';
import { RectButton } from '../../../components/rectButton/RectButton';
import { RectButtonType } from '../../../components/rectButton/models/RectButtonType';
import './RoomCommands.css';
import { RoomCommandsProps } from './RoomCommandsProps';
import whiteCircle from '../../../../resources/images/white_circle.svg';
import { GameStatus } from '../../../../models/GameStatus';
import { StoreState } from '../../../../redux/state';
import roomsSelectors from '../../../../redux/roomsStore/roomsSelectors';

enum ComponentState {
  waitingForCommand = 'waitingForCommand',
  waitingForGameToFinish = 'waitingForGameToFinish',
  failedToJoin = 'failedToJoin',
  failedToLeave = 'failedToLeave',
  failedToDelete = 'failedToDelete',
  failedToStart = 'failedToStart'
}

export function RoomCommands(props: RoomCommandsProps): Component {
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const gameStatus: Optional<GameStatus> = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameStatus(state, props.room.id)
  );
  const [componentState, setComponentState]: State<ComponentState> = useState<ComponentState>(
    ComponentState.waitingForCommand
  );

  useEffect(() => {
    if (gameStatus === GameStatus.started) {
      setComponentState(ComponentState.waitingForGameToFinish);
    } else {
      setComponentState(ComponentState.waitingForCommand);
    }
  }, [gameStatus]);

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    dispatch(roomsEpicActions.observeRoomGameStart({ roomId: props.room.id, willUnmount$ }));
    dispatch(roomsEpicActions.observeRoomGameEnd({ roomId: props.room.id, willUnmount$ }));
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  function joinRoom(): void {
    emit$(ClientEvent.joinRoom, { roomId: props.room.id }).subscribe({
      error: () => setComponentState(ComponentState.failedToJoin)
    });
  }

  function leaveRoom(): void {
    emit$(ClientEvent.joinWaitingRoom).subscribe({
      next: goToRooms,
      error: () => setComponentState(ComponentState.failedToLeave)
    });
  }

  function deleteRoom(): void {
    (dispatch as DispatchObserve)(roomsEpicActions.deleteRoom({ roomId: props.room.id })).subscribe({
      error: () => setComponentState(ComponentState.failedToDelete)
    });
  }

  function startGame(): void {
    emit$(ClientEvent.startGame).subscribe({ error: () => setComponentState(ComponentState.failedToStart) });
  }

  function goToRooms(): void {
    history.push('/rooms');
  }

  function commands(): Component {
    return (
      <Grid>
        {props.isManager ? <RectButton title="Start" type={RectButtonType.confirm} onClick={startGame} /> : <Empty />}
        {!props.hasJoined && props.room.nbPlayers < props.room.maxPlayer ? (
          <RectButton title="Join" type={RectButtonType.confirm} onClick={joinRoom} />
        ) : (
          <Empty />
        )}
        {props.hasJoined ? (
          <RectButton title="Leave" type={RectButtonType.destructive} onClick={leaveRoom} />
        ) : (
          <Empty />
        )}
        {props.isManager ? (
          <RectButton title="Delete room" type={RectButtonType.destructive} onClick={deleteRoom} />
        ) : (
          <Empty />
        )}
      </Grid>
    );
  }

  function gameIndicator(): Component {
    return (
      <div className="game_indicator in_game_animation">
        <img src={whiteCircle} />
        <h3>Game</h3>
      </div>
    );
  }

  return (
    <Box title="Infos">
      {componentState === ComponentState.waitingForCommand ? commands() : gameIndicator()}
      <Grid columns={1}>
        <div className="infos">
          {componentState !== ComponentState.waitingForGameToFinish &&
          !props.hasJoined &&
          props.room.nbPlayers < props.room.maxPlayer ? (
            <h3>You have not joined the room</h3>
          ) : undefined}
          {componentState !== ComponentState.waitingForGameToFinish &&
          !props.hasJoined &&
          props.room.nbPlayers >= props.room.maxPlayer ? (
            <h3>You cannot join the room because it is already full of players.</h3>
          ) : undefined}
          {componentState === ComponentState.waitingForGameToFinish ? (
            <h3>You can join the room once the game is finished.</h3>
          ) : undefined}
        </div>
        {componentState === ComponentState.failedToJoin ? (
          <div className="error" data-testid="failed_to_join_error">
            Failed to join room. Please retry.
          </div>
        ) : (
          <Empty />
        )}
        {componentState === ComponentState.failedToLeave ? (
          <div className="error" data-testid="failed_to_leave_error">
            Failed to leave room. Please retry.
          </div>
        ) : (
          <Empty />
        )}
        {componentState === ComponentState.failedToDelete ? (
          <div className="error" data-testid="failed_to_delete_error">
            Failed to delete room. Please retry.
          </div>
        ) : (
          <Empty />
        )}
      </Grid>
    </Box>
  );
}
