import { RectButtonType } from './models/RectButtonType';

export interface RectButtonProps {
  title: string;
  type?: RectButtonType;
  onClick?: () => void;
}
