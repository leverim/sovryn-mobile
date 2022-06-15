import { Dispatch } from 'react';
import { TokenId } from 'types/asset';
import { ChainId } from 'types/network';
import { BorrowTokenInfo } from 'utils/interactions/loan-token';
import { Action, BorrowPoolAction, BorrowState, State } from './types';

export const useActions = (state: State, dispatch: Dispatch<Action>) => ({
  init: (items: BorrowState) =>
    dispatch({ type: BorrowPoolAction.INIT_POOLS, value: items }),
  set: (chainId: ChainId, loanTokenId: TokenId, item: BorrowTokenInfo) =>
    dispatch({
      type: BorrowPoolAction.ADD_POOL_INFO,
      value: { chainId, loanTokenId, item },
    }),
});
