import { Component } from '../../../shared/Types';
import { GridProps } from './GridProps';
import './Grid.css';

export function Grid(props: GridProps): Component {
  function templateColumns(): string {
    return Array.from({ length: props.columns || 1 })
      .map(() => '1fr')
      .join(' ');
  }
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: templateColumns(),
        gridGap: props.spacing
      }}
    >
      {props.children}
    </div>
  );
}
