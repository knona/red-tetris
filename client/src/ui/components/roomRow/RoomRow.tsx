import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Subject } from 'rxjs';
import { GameStatus } from '../../../models/GameStatus';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import roomsSelectors from '../../../redux/roomsStore/roomsSelectors';
import { StoreState } from '../../../redux/state';
import { Component, Optional } from '../../../shared/Types';
import { playerNumberString } from '../../../utils/strings';
import './RoomRow.css';
import { RoomRowProps } from './RoomRowProps';
import redCircle from '../../../resources/images/red_circle.svg';
import { useHistory } from 'react-router';
import { History } from 'history';

export function RoomRow(props: RoomRowProps): Component {
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const gameStatus: Optional<GameStatus> = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameStatus(state, props.room.id)
  );

  function goToRoom(roomId: string): void {
    history.push(`/rooms/${roomId}`);
  }

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    dispatch(roomsEpicActions.observeRoomGameStart({ roomId: props.room.id, willUnmount$ }));
    dispatch(roomsEpicActions.observeRoomGameEnd({ roomId: props.room.id, willUnmount$ }));
    dispatch(roomsEpicActions.observePlayerAddedToRoom({ roomId: props.room.id, willUnmount$ }));
    dispatch(roomsEpicActions.observePlayerRemovedFromRoom({ roomId: props.room.id, willUnmount$ }));
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  return (
    <div className="room_row_container">
      <button className="room_row" data-testid="room_row" onClick={(): void => goToRoom(props.room.id)}>
        <h2 data-testid="room_row_name">{props.room.name}</h2>
        <div className="infos">
          <div className="in_game" style={{ opacity: gameStatus === GameStatus.started ? 1 : 0 }} data-testid="in_game">
            <img className="in_game_animation" src={redCircle} />
            <h3 className="in_game_animation">Game</h3>
          </div>
          <h3 data-testid="room_row_nb_players">{playerNumberString(props.room.nbPlayers)}</h3>
        </div>
      </button>
    </div>
  );
}
