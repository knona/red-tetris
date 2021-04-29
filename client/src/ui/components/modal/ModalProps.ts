import { Component } from '../../../shared/Types';
import { ModalAction } from './models/ModalAction';

export interface ModalProps {
  title: string;
  children?: Component | Component[];
  actions?: [ModalAction];
  cancelAction?: ModalAction;
}
