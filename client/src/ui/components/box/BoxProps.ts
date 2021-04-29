import { Component } from '../../../shared/Types';

export interface BoxProps {
  title: string;
  scrollable?: boolean;
  toolbar?: Component;
  children?: Component | Component[];
}
