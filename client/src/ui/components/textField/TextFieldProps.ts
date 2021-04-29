export interface TextFieldProps {
  onTextChange: (text: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  focus?: boolean;
}
