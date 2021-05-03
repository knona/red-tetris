import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { Subject } from 'rxjs';
import roomsEpicActions from '../../../../redux/roomsStore/roomsEpicActions';
import { Component } from '../../../../shared/Types';
import { Box } from '../../../components/box/Box';
import { Grid } from '../../../components/grid/Grid';
import { PlayerRow } from '../../../components/playerRow/PlayerRow';
import { WaitingRoomProps } from './WaitingRoomProps';

export function WaitingRoom(props: WaitingRoomProps): Component {
  const dispatch: Dispatch<AnyAction> = useDispatch();

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    dispatch(roomsEpicActions.getRoom({ roomId: props.waitingRoom.id }));
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  return (
    <Box title="Waiting" scrollable={props.waitingRoom.nbPlayers > 0}>
      {props.waitingRoom.nbPlayers === 0 ? (
        <Grid>
          <h3 data-testid="waiting_room_no_player_message">No waiting player.</h3>
        </Grid>
      ) : (
        <Grid>
          {props.waitingRoom.players.map(player => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
