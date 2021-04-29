import { History } from 'history';
import { useState } from 'react';
import { Dispatch, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { AnyAction } from 'redux';
import { Subject } from 'rxjs';
import { GamingRoom } from '../../../../models/GamingRoom';
import { DispatchObserve } from '../../../../redux/observableActions';
import roomsEpicActions from '../../../../redux/roomsStore/roomsEpicActions';
import roomsSelectors from '../../../../redux/roomsStore/roomsSelectors';
import { Component, State } from '../../../../shared/Types';
import { Box } from '../../../components/box/Box';
import { EmptyContent } from '../../../components/emptyContent/EmptyContent';
import { Grid } from '../../../components/grid/Grid';
import { RectButton } from '../../../components/rectButton/RectButton';
import { RoomRow } from '../../../components/roomRow/RoomRow';
import { Toolbar } from '../../../components/toolbar/Toolbar';

enum ComponentState {
  default = 'default',
  failedToFetchRooms = 'failedToFetchRooms'
}

export function RoomList(): Component {
  const [currentState, setCurrentState]: State<ComponentState> = useState<ComponentState>(ComponentState.default);
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const rooms: GamingRoom[] = useSelector(roomsSelectors.getRooms);

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    (dispatch as DispatchObserve)(roomsEpicActions.getRooms()).subscribe({
      error: () => setCurrentState(ComponentState.failedToFetchRooms)
    });
    dispatch(roomsEpicActions.observeAddedRoom({ willUnmount$ }));
    dispatch(roomsEpicActions.observeRemovedRoom({ willUnmount$ }));

    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  function goToCreatRoom(): void {
    history.push('/createRoom');
  }

  return (
    <Box
      title="Rooms"
      scrollable={rooms.length > 0}
      toolbar={
        <Toolbar>
          <RectButton title="New" onClick={goToCreatRoom} />
        </Toolbar>
      }
    >
      {currentState === ComponentState.default ? (
        <div>
          {rooms.length === 0 ? (
            <EmptyContent title="No rooms" action={{ title: 'Create Room', onPerform: goToCreatRoom }} />
          ) : (
            <Grid columns={2}>
              {rooms.map(room => (
                <RoomRow key={room.id} room={room} />
              ))}
            </Grid>
          )}
        </div>
      ) : (
        <div className="error" data-testid="failed_to_fetch_rooms_error">
          Failed to fetch rooms.
        </div>
      )}
    </Box>
  );
}
