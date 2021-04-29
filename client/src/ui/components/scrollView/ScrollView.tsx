import { Component } from '../../../shared/Types';
import { ScrollViewProps } from './ScrollViewProps';
import './ScrollView.css';

export function ScrollView(props: ScrollViewProps): Component {
  return <div className="scroll_view">{props.children}</div>;
}
