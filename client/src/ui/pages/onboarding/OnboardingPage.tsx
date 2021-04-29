import { History } from 'history';
import { useHistory } from 'react-router';
import { Component } from '../../../shared/Types';
import { RectButton } from '../../components/rectButton/RectButton';
import { LogoImage } from './components/LogoImage/LogoImage';
import './OnboardingPage.css';

export function OnboardingPage(): Component {
  const history: History = useHistory();

  function goToCreatePlayer(): void {
    history.push('/createPlayer');
  }

  return (
    <div className="onboarding_container">
      <LogoImage />
      <RectButton title="Start" onClick={goToCreatePlayer} />
    </div>
  );
}
