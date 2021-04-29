import { useEffect, useState } from 'react';
import { Component, State } from '../../../../shared/Types';
import { CountdownProps } from './CountdownProps';
import './Countdown.css';

export function Countdown(props: CountdownProps): Component {
  const [countdown, setCountdown]: State<number> = useState(3);

  useEffect(() => {
    if (countdown === -1) {
      props.onCountdownFinished();
      return;
    }
    setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
  }, [countdown]);

  function textForCountdown(value: number): string {
    if (value <= 0) {
      return 'Go!';
    }
    return `${value}`;
  }

  return (
    <div className="countdown_overlay">
      <div className="countdown">{textForCountdown(countdown)}</div>
    </div>
  );
}
