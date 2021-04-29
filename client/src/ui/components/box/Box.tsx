import { Component } from '../../../shared/Types';
import { BoxProps } from './BoxProps';
import './Box.css';

export function Box(props: BoxProps): Component {
  return (
    <div className="box">
      <div className="box_top_bar">
        <div className="box_title">{props.title}</div>
        <div className="box_toolbar">{props.toolbar}</div>
      </div>
      <div className={props.scrollable ?? true ? 'box_content_scrollable' : 'box_content'}>{props.children}</div>
    </div>
  );
}
