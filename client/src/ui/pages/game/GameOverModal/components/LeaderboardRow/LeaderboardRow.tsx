import { Component } from '../../../../../../shared/Types';
import { LeaderboardRowProps } from './LeaderboardRowProps';
import goldMedal from '../../../../../../resources/images/gold_medal.svg';
import silverMedal from '../../../../../../resources/images/silver_medal.svg';
import bronzeMedal from '../../../../../../resources/images/bronze_medal.svg';
import './LeaderboardRow.css';

export function LeaderboardRow(props: LeaderboardRowProps): Component {
  function imageNameForPosition(positon: number): string {
    switch (positon) {
      case 1:
        return goldMedal;
      case 2:
        return silverMedal;
      default:
        return bronzeMedal;
    }
  }
  return (
    <div className="leaderboard_row">
      <div className="position_container">
        <img src={imageNameForPosition(props.position)} style={{ opacity: props.position > 3 ? 0 : 1 }} />
        <h3>{props.position}</h3>
      </div>
      <div className="username">
        {props.isCurrentplayer ? <h3>You</h3> : undefined}
        {props.isCurrentplayer ? <div className="spacer"></div> : undefined}
        <h2>{props.username}</h2>
      </div>
    </div>
  );
}
