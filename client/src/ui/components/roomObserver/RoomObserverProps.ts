import { Component } from '../../../shared/Types';
import { RoomObserverAction } from './models/RoomObserverAction';

export interface RoomObserverProps {
  roomId?: string;
  actions: RoomObserverAction[];
  children: Component;
}
