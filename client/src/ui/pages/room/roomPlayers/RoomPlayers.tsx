import { Player } from '../../../../models/Player';
import { Component } from '../../../../shared/Types';
import { nArray } from '../../../../utils/array';
import { playerNumberString } from '../../../../utils/strings';
import { Box } from '../../../components/box/Box';
import { Grid } from '../../../components/grid/Grid';
import { PlayerRow } from '../../../components/playerRow/PlayerRow';
import { Toolbar } from '../../../components/toolbar/Toolbar';
import { RoomPlayersProps } from './RoomPlayersProps';
import './RoomPlayer.css';

export function RoomPlayers(props: RoomPlayersProps): Component {
  function playerRow(index: number): Component {
    if (index < props.room.nbPlayers) {
      const player: Player = props.room.players[index];
      return <PlayerRow key={player.id} player={player} />;
    } else {
      return <div key={index} className="empty_row"></div>;
    }
  }

  return (
    <Box
      title={props.room.name}
      toolbar={
        <Toolbar>
          <h3>{playerNumberString(props.room.nbPlayers)}</h3>
        </Toolbar>
      }
    >
      <Grid columns={2}>{nArray(props.room.maxPlayer).map(playerRow)}</Grid>
    </Box>
  );
}
