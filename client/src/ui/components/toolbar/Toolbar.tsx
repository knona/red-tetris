import { Component } from '../../../shared/Types';
import { ToolbarProps } from './ToolbarProps';
import './Toolbar.css';

export function Toolbar(props: ToolbarProps): Component {
  return <div className="toolbar">{props.children}</div>;
}
