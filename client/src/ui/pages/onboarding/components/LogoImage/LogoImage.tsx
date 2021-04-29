import { Component } from '../../../../../shared/Types';
import logo from './../../../../../resources/images/logo.svg';

export function LogoImage(): Component {
  return <img className="logo_image" src={logo} alt="Red Tetris logo" />;
}
