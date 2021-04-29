import { Component, State } from '../../../../shared/Types';
import tetrisSelectors from '../../../../redux/tetrisStore/tetrisSelectors';
import { useSelector } from 'react-redux';
import './Score.css';
import { useEffect, useState } from 'react';

export function Score(): Component {
  const [scoreAnimation, setScoreAnimation]: State<number> = useState<number>(0);
  const score: number = useSelector(tetrisSelectors.getScore);
  const level: number = useSelector(tetrisSelectors.getLevel);

  useEffect(() => {
    if (score === 0) {
      return;
    }
    setScoreAnimation(1);
  }, [score]);

  return (
    <div className="score">
      <div className="level" data-testid="level">
        Level {level}
      </div>
      <div
        className="score"
        data-testid="score"
        data-score-animation={scoreAnimation}
        onAnimationEnd={(): void => setScoreAnimation(0)}
      >
        {score}
      </div>
    </div>
  );
}
