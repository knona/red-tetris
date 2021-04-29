import { Component } from '../../../shared/Types';
import { Empty } from '../empty/Empty';
import { RectButton } from '../rectButton/RectButton';
import { EmptyContentProps } from './EmptyContentProps';
import './EmptyContent.css';

export function EmptyContent(props: EmptyContentProps): Component {
  return (
    <div className="empty_content" data-testid={props.title}>
      <h3>{props.title}</h3>
      {props.action ? <RectButton title={props.action.title} onClick={props.action.onPerform} /> : <Empty />}
    </div>
  );
}
