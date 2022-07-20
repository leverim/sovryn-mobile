import { set } from 'lodash';
import { NoUpdate, Update } from 'store/side-effects';
import { Action, State, BorrowPoolAction } from './types';

export const initialState: State = {
  pools: {},
};

export const reducer = (prevState: State = initialState, action: Action) => {
  switch (action.type) {
    case BorrowPoolAction.INIT_POOLS:
      console.log('pools loaded', action.value);
      return Update<State>({ ...prevState, pools: action.value });
    case BorrowPoolAction.ADD_POOL_INFO:
      const pools = set(
        prevState.pools,
        [action.value.chainId, action.value.loanTokenId],
        action.value.item,
      );
      console.log('pool set', pools);
      return Update<State>({ ...prevState, pools });
    default:
      return NoUpdate();
  }
};
