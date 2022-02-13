import React, { createContext } from 'react';
import useCreateReducerWithEffect from 'store/side-effects';
import { useActions } from './actions';
import { initialState, reducer } from './reducers';
import { State } from './types';

type ContextState = {
  state: State;
  actions: ReturnType<typeof useActions>;
};

export const TransactionContext = createContext<ContextState>({
  state: initialState,
} as ContextState);

export const TransactionsProvider: React.FC = React.memo(({ children }) => {
  const [state, dispatch] = useCreateReducerWithEffect(reducer, initialState);
  const actions = useActions(state, dispatch);
  return (
    <TransactionContext.Provider value={{ state, actions }}>
      {children}
    </TransactionContext.Provider>
  );
});
