import React, { Dispatch, Reducer, ReducerAction, ReducerState } from 'react';
import { AnyAction, CombinedState } from 'redux';

// React

/**
 * Used as the return type of a React function component.
 */
export type Component = JSX.Element;

export type FunctionState<T> = React.Dispatch<React.SetStateAction<T>>;
/**
 * Used as the return type of the useState function.
 */
export type State<T> = [T, FunctionState<T>];
export type ComponentStore<S, A = AnyAction> = [ReducerState<Reducer<S, A>>, Dispatch<ReducerAction<Reducer<S, A>>>];

// Redux
export type CombinedReducer<T, S> = Reducer<CombinedState<T>, S>;

// App

export type Optional<T> = T | undefined;
