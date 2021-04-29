import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { createObservableAction, ObservableActionCreator } from '../observableActions';

const connectionSuccess: ActionCreatorWithPayload<any> = createAction('epic:player/connectionSuccess');
const connectionFailure: ActionCreatorWithPayload<any> = createAction('epic:player/connectionFailure');
const connection: ObservableActionCreator<{ username: string }> = createObservableAction('epic:player/connection', {
  successType: connectionSuccess.type,
  errorType: connectionFailure.type
});

export default {
  connectionFailure,
  connectionSuccess,
  connection
};
