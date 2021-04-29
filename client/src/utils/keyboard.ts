import { fromEvent, merge, NEVER, Observable, of, Subject, timer } from 'rxjs';
import { filter, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';

export enum KeyCode {
  arrowLeft = 'ArrowLeft',
  arrowRight = 'ArrowRight',
  arrowDown = 'ArrowDown',
  arrowUp = 'ArrowUp',
  space = 'Space',
  z = 'KeyZ',
  c = 'KeyC',
  ctrlLeft = 'ControlLeft',
  shiftLeft = 'ShiftLeft'
}

function keyDown$(key: KeyCode): Observable<KeyboardEvent> {
  return fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    filter(event => event.code === key),
    filter(event => event.repeat === false)
  );
}

function keyUp$(key: KeyCode): Observable<KeyboardEvent> {
  return fromEvent<KeyboardEvent>(document, 'keyup').pipe(filter(event => event.code === key));
}

function windowBlur$(): Observable<FocusEvent> {
  return fromEvent<FocusEvent>(window, 'blur');
}

export function keyPressed$(keys: KeyCode | KeyCode[]): Observable<KeyboardEvent> {
  if (Array.isArray(keys)) {
    return merge(...keys.map(key => keyPressed$(key)));
  }
  const key: KeyCode = keys;
  return merge(keyDown$(key), keyUp$(key), windowBlur$()).pipe(
    switchMap(event => (event.type === 'keydown' ? merge(of(event), timer(150, 50).pipe(mapTo(event))) : NEVER))
  ) as Observable<KeyboardEvent>;
}

export function keyPressedNoRepeat$(keys: KeyCode | KeyCode[]): Observable<KeyboardEvent> {
  if (Array.isArray(keys)) {
    return merge(...keys.map(key => keyPressedNoRepeat$(key)));
  }
  const key: KeyCode = keys;
  return keyDown$(key);
}

export function observeKeyboardEvent(
  keys: KeyCode | KeyCode[],
  willUnmount$: Subject<void>,
  cb: (event: KeyboardEvent) => void
): void {
  keyPressed$(keys).pipe(tap(cb), takeUntil(willUnmount$)).subscribe();
}

export function observeKeyboardEventNoRepeat(
  keys: KeyCode | KeyCode[],
  willUnmount$: Subject<void>,
  cb: (event: KeyboardEvent) => void
): void {
  keyPressedNoRepeat$(keys).pipe(tap(cb), takeUntil(willUnmount$)).subscribe();
}
