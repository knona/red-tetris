import { AnyAction, Store } from '@reduxjs/toolkit';
import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory, History } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createStore } from '../redux/configureStore';
import { StoreState } from '../redux/state';
import { initialTetrisState } from '../redux/tetrisStore/tetrisState';
import { Component } from '../shared/Types';
import Test from './tests';

function render(
  ui: Component,
  {
    initialState = {
      player: { player: Test.testPlayer() },
      rooms: {
        waitingRoom: Test.testWaitingRoom(),
        rooms: []
      },
      tetris: initialTetrisState
    },
    history = createMemoryHistory()
  }: {
    initialState?: StoreState;
    history?: History;
  } = {}
): any {
  function Wrapper({ children }: any): Component {
    const store: Store<StoreState, AnyAction> = createStore(initialState);
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper });
}

export * from '@testing-library/react';
export { render };
