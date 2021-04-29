import { Component } from '../../../shared/Types';
import { RectButtonProps } from './RectButtonProps';
import './RectButton.css';
import { RectButtonType } from './models/RectButtonType';

export function RectButton(props: RectButtonProps): Component {
  return (
    <button
      className={`rect_button ${props.type || RectButtonType.default}`}
      data-testid={props.title}
      onClick={props.onClick}
    >
      {props.title}
    </button>
  );
}
