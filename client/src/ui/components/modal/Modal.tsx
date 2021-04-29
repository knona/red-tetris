import { Component } from '../../../shared/Types';
import { Box } from '../box/Box';
import { RectButton } from '../rectButton/RectButton';
import { ModalProps } from './ModalProps';
import './Modal.css';
import { ModalAction } from './models/ModalAction';
import { RectButtonType } from '../rectButton/models/RectButtonType';

export function Modal(props: ModalProps): Component {
  return (
    <div className="modal_container">
      <div className="modal">
        <Box title={props.title}>
          <div className="modal_content">{props.children}</div>
          <div className="modal_actions">
            {(props.actions || []).map((action: ModalAction) => (
              <RectButton key={action.title} title={action.title} type={action.type} onClick={action.onPerform} />
            ))}
            {props.cancelAction && (
              <RectButton
                title={props.cancelAction.title}
                type={RectButtonType.secondary}
                onClick={props.cancelAction.onPerform}
              />
            )}
          </div>
        </Box>
      </div>
    </div>
  );
}
