import { Component } from '../../../shared/Types';

export interface GridProps {
  children: Component | Component[];
  columns?: number;
  spacing?: number;
}
