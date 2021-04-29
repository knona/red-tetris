import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AnyAction, Store } from 'redux';
import { createStore } from '../../../redux/configureStore';
import { StoreState } from '../../../redux/state';
import { Component } from '../../../shared/Types';
import { AppNavigation } from '../appNavigation/AppNavigation';
import './App.css';

export function App(): Component {
  const store: Store<StoreState, AnyAction> = createStore();
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppNavigation />
      </BrowserRouter>
    </Provider>
  );
}
