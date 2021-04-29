import { Component } from '../../../shared/Types';
import { TextFieldProps } from './TextFieldProps';
import './TextField.css';
import { useRef } from 'react';
import React from 'react';
import { useEffect } from 'react';

export function TextField(props: TextFieldProps): Component {
  const inputRef: any = useRef();

  useEffect(() => {
    if (props.focus ?? false) {
      inputRef.current.focus();
    }
  }, []);

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter' && props.onEnter) {
      props.onEnter();
    }
  }

  return (
    <div className="text_field">
      <input
        type="text"
        placeholder={props.placeholder}
        onChange={(event): void => {
          props.onTextChange(event.target.value);
        }}
        onKeyUp={handleKeyUp}
        ref={inputRef}
        data-testid={props.placeholder ?? 'text_field'}
      />
    </div>
  );
}
