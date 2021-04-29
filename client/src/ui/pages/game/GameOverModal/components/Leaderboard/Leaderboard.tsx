import { Component } from '../../../../../../shared/Types';
import { Empty } from '../../../../../components/empty/Empty';
import { Grid } from '../../../../../components/grid/Grid';
import { ScrollView } from '../../../../../components/scrollView/ScrollView';
import { LeaderboardRow } from '../LeaderboardRow/LeaderboardRow';
import './Leaderboard.css';
import { LeaderboardProps } from './LeaderboardProps';

export function Leaderboard(props: LeaderboardProps): Component {
  return (
    <div className="leaderboard">
      <ScrollView>
        <Grid spacing={4}>
          {props.alivePlayers.map(player => (
            <div className="empty_leaderboard_row" key={player.id}></div>
          ))}
        </Grid>
        {props.alivePlayers.length > 0 && props.loserPlayers.length > 0 ? <div className="spacer"></div> : <Empty />}
        <Grid spacing={4}>
          {props.loserPlayers.reverse().map((player, index) => (
            <LeaderboardRow
              key={player.id}
              position={index + props.alivePlayers.length + 1}
              username={player.username}
              isCurrentplayer={player.id === props.player.id}
            />
          ))}
        </Grid>
      </ScrollView>
    </div>
  );
}
