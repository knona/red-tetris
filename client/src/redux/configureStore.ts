import { configureStore } from '@reduxjs/toolkit';
import { AnyAction, Store } from 'redux';
import { combineEpics, createEpicMiddleware, EpicMiddleware } from 'redux-observable';
import { ObservableActionsMiddleware } from './observableActions';
import { playerEpic } from './playerStore/playerEpic';
import { playerReducer } from './playerStore/playerStore';
import { roomsEpic } from './roomsStore/roomsEpic';
import { roomsReducer } from './roomsStore/roomsStore';
import { StoreState } from './state';
import { tetrisEpic } from './tetrisStore/tetrisEpic';
import { tetrisReducer } from './tetrisStore/tetrisStore';

export function createStore(preloadedState?: StoreState): Store<StoreState, AnyAction> {
  const epicMiddleware: EpicMiddleware<AnyAction> = createEpicMiddleware();
  const rootEpic: any = combineEpics(roomsEpic, playerEpic, tetrisEpic);
  const store: Store<StoreState, AnyAction> = configureStore({
    reducer: { player: playerReducer, rooms: roomsReducer, tetris: tetrisReducer },
    devTools: false,
    middleware: [ObservableActionsMiddleware, epicMiddleware],
    preloadedState: preloadedState
  });
  epicMiddleware.run(rootEpic);
  return store;
}
