import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  ActionCreatorWithPreparedPayload,
  createAction
} from '@reduxjs/toolkit';
import { AnyAction, Middleware } from 'redux';
import { Observable, of, Subject } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

export interface ActionLifecycle {
  successType: string;
  errorType: string;
}

type SubcriberNext = (value?: any) => void;
type SubscriberError = (err: any) => void;

export const ObservableActionsMiddleware: Middleware = () => {
  return (next): ((action: AnyAction) => Observable<any> | AnyAction) => {
    const pending: { [key: string]: SubcriberNext | SubscriberError } = {};
    return (action): Observable<any> | AnyAction => {
      let ret: Observable<any> | AnyAction;

      const lifecycle: ActionLifecycle = action.meta?.lifecycle;
      if (lifecycle) {
        const subject: Subject<any> = new Subject();
        pending[lifecycle.successType] = (value?: any): void => {
          subject.next(value);
          subject.complete();
        };
        pending[lifecycle.errorType] = (err: any): void => subject.error(err);
        ret = subject.asObservable();
        next(action);
      } else {
        ret = next(action);
      }

      if (pending[action.type]) {
        const subscriberFunction: SubcriberNext | SubscriberError = pending[action.type];
        delete pending[action.type];
        subscriberFunction(action.payload);
      }
      return ret;
    };
  };
};

export type ObservableActionCreator<T = void> = ActionCreatorWithPreparedPayload<
  [T],
  T,
  string,
  never,
  { lifecycle: ActionLifecycle }
>;

export function createObservableAction<T = void>(
  actionType: string,
  lifecycle: ActionLifecycle
): ObservableActionCreator<T> {
  return createAction(actionType, (payload: T) => ({ payload, meta: { lifecycle } }));
}

export function failableEpic<T, S>(
  epic: (action$: Observable<T>) => Observable<S>,
  errorAction: ActionCreatorWithoutPayload
): (action$: Observable<T>) => Observable<S | { type: string }> {
  return (action$): Observable<S | { type: string }> =>
    epic(action$).pipe(catchError(() => of({ type: errorAction.type })));
}

export function observableEpic<T extends AnyAction, S extends AnyAction, R>(
  epic: (action$: Observable<T>) => Observable<S>,
  successAction: ActionCreatorWithPayload<R>,
  errorAction: ActionCreatorWithPayload<any>
): (action$: Observable<T>) => Observable<S | ReturnType<typeof successAction> | ReturnType<typeof errorAction>> {
  return (action$): Observable<S | ReturnType<typeof successAction> | ReturnType<typeof errorAction>> =>
    epic(action$).pipe(
      mergeMap(action => [action, successAction(action.payload)]),
      catchError(err => of(errorAction(err)))
    );
}

export type DispatchObserve = <T extends AnyAction>(action: T) => Observable<any>;
