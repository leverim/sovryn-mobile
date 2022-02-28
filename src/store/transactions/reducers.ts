import { TransactionResponse } from '@ethersproject/providers';
import { Dispatch } from 'react';
import { NoUpdate, UpdateWithSideEffect } from 'store/side-effects';
import { ChainId } from 'types/network';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_TRANSACTIONS } from 'utils/constants';
import { prettifyTx } from 'utils/helpers';
import { getProvider } from 'utils/RpcEngine';
import { Action, State, TransactionAction } from './types';

export const initialState: State = {
  transactions: [],
};

const handleTxReceipt = (
  tx: TransactionResponse,
  dispatch: Dispatch<Action>,
) => {
  tx.wait()
    .then(receipt =>
      dispatch({ type: TransactionAction.ADD_RECEIPT, value: receipt }),
    )
    .catch(error =>
      dispatch({
        // todo: figure out what actually happens with receipt of replaced transaction
        // https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
        type: TransactionAction.ADD_RECEIPT,
        value: error.receipt,
      }),
    );
};

export const reducer = (prevState: State = initialState, action: Action) => {
  switch (action.type) {
    case TransactionAction.INIT_TRANSACTIONS:
      return UpdateWithSideEffect<State, Action>(
        {
          transactions: action.value.map(item => ({
            ...item,
            response: getProvider(
              item.response.chainId as ChainId,
            )._wrapTransaction(item.response),
          })),
        },
        (state, dispatch) => {
          state.transactions
            .filter(item => item.response.confirmations < 3)
            .forEach(({ response }) => handleTxReceipt(response, dispatch));
        },
      );
    case TransactionAction.ADD_TRANSACTION:
      return UpdateWithSideEffect<State, Action>(
        {
          transactions: [...prevState.transactions, { response: action.value }],
        },
        (state, dispatch) => {
          cache.set(STORAGE_CACHE_TRANSACTIONS, state.transactions);
          handleTxReceipt(action.value, dispatch);
        },
      );
    case TransactionAction.ADD_RECEIPT:
      const index = prevState.transactions.findIndex(
        item => item.response.hash === action.value.transactionHash,
      );
      if (index !== -1) {
        prevState.transactions[index].receipt = action.value;
        prevState.transactions[index].response.confirmations =
          action.value.confirmations;
      }

      return UpdateWithSideEffect<State>(prevState, state => {
        cache.set(STORAGE_CACHE_TRANSACTIONS, state.transactions);

        global.toast.show(
          `Transaction ${prettifyTx(action.value.transactionHash)} ${
            action.value.status ? 'confirmed' : 'failed'
          }!`,
          {
            type: 'success',
            placement: 'top',
          },
        );
      });
    default:
      return NoUpdate();
  }
};
