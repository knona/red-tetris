import { useEffect, useState } from 'react';
import { State } from '../shared/Types';

export function useResize(ref: any): { width: number; height: number } {
  const [width, setWidth]: State<number> = useState(0);
  const [height, setHeight]: State<number> = useState(0);

  useEffect(didResize, []);
  useEffect(() => {
    window.addEventListener('resize', didResize);
    return (): void => {
      window.removeEventListener('resize', didResize);
    };
  }, [ref]);

  function didResize(): void {
    setWidth(ref.current.offsetWidth);
    setHeight(ref.current.offsetHeight);
  }

  return { width, height };
}
