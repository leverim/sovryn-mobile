import React, { createContext, useEffect } from 'react';
import useCreateReducerWithEffect from 'store/side-effects';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_BORROW_POOLS } from 'utils/constants';
import { useActions } from './actions';
import { initialState, reducer } from './reducers';
import { State } from './types';

type ContextState = {
  state: State;
  actions: ReturnType<typeof useActions>;
};

export const BorrowPoolContext = createContext<ContextState>({
  state: initialState,
} as ContextState);

export const BorrowPoolProvider: React.FC = React.memo(({ children }) => {
  const [state, dispatch] = useCreateReducerWithEffect(reducer, initialState);
  const actions = useActions(state, dispatch);

  useEffect(() => {
    cache.on('loaded', () => {
      actions.init(cache.get(STORAGE_CACHE_BORROW_POOLS, {}));
    });
  }, [actions]);

  return (
    <BorrowPoolContext.Provider value={{ state, actions }}>
      {children}
    </BorrowPoolContext.Provider>
  );
});
