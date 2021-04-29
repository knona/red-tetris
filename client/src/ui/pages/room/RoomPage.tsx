import { History } from 'history';
import { Dispatch, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { AnyAction } from 'redux';
import { Subject } from 'rxjs';
import { GameStatus } from '../../../models/GameStatus';
import { GamingRoom } from '../../../models/GamingRoom';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import roomsSelectors from '../../../redux/roomsStore/roomsSelectors';
import { StoreState } from '../../../redux/state';
import { ClientEvent } from '../../../shared/Events';
import { emit$ } from '../../../shared/Socket';
import { Component, Optional } from '../../../shared/Types';
import { Empty } from '../../components/empty/Empty';
import { RoomCommands } from './roomCommands/RoomCommands';
import './RoomPage.css';
import { RoomPageProps } from './RoomPageProps';
import { RoomPlayers } from './roomPlayers/RoomPlayers';

interface RoomParams {
  roomId: string;
}

export function RoomPage(props: RoomPageProps): Component {
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const { roomId }: RoomParams = useParams<RoomParams>();
  const room: Optional<GamingRoom> = useSelector((state: StoreState) => roomsSelectors.getRoomWithId(state, roomId));
  const gameStatus: Optional<GameStatus> = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameStatus(state, roomId)
  );
  const isManager: boolean = room?.managerId === props.player.id ?? false;
  const hasJoined: boolean = room?.players.some(player => player.id === props.player.id) ?? false;

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    dispatch(roomsEpicActions.getRoom({ roomId: roomId }));
    dispatch(roomsEpicActions.observePlayerAddedToRoom({ roomId: roomId, willUnmount$ }));
    dispatch(roomsEpicActions.observePlayerRemovedFromRoom({ roomId: roomId, willUnmount$ }));
    dispatch(roomsEpicActions.observeRemovedRoom({ roomId: roomId, willUnmount$ }));
    dispatch(roomsEpicActions.observeRoomManagerChanges({ roomId: roomId, willUnmount$ }));
    dispatch(roomsEpicActions.observeRoomGameStart({ roomId: roomId, willUnmount$ }));
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.started && hasJoined) {
      history.push(`/game/${roomId}`);
    }
  }, [room, gameStatus]);

  useEffect(() => {
    if (!room) {
      history.replace('/rooms');
    }
    const unblockHistory: any = history.block((_, action): any => {
      if (hasJoined && action === 'POP') {
        const wantToLeaveRoom: boolean = confirm('Are you sure you want to leave the room?');
        if (wantToLeaveRoom) {
          leaveRoom();
          return true;
        }
        return false;
      }
      return true;
    });
    return (): void => {
      unblockHistory();
    };
  }, [room]);

  function leaveRoom(): void {
    emit$(ClientEvent.joinWaitingRoom).subscribe({ error: keepOnPage });
  }

  function keepOnPage(): void {
    history.push(`/rooms/${room?.id}`);
  }

  return (
    <div className="room_page">
      {room ? (
        <div className="room_container">
          <div className="room">
            <div className="player_list">
              <RoomPlayers room={room} />
            </div>
            <div className="commands">
              <RoomCommands room={room} isManager={isManager} hasJoined={hasJoined} />
            </div>
          </div>
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
}
