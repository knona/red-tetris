import { RectButtonType } from '../../rectButton/models/RectButtonType';

export interface ModalAction {
  title: string;
  onPerform: () => void;
  type?: RectButtonType;
}
