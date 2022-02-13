import { Dispatch } from 'react';
import {
  TransactionResponse,
  TransactionReceipt,
} from '@ethersproject/providers';
import {
  Action,
  State,
  TransactionAction,
  TransactionHistoryItem,
} from './types';

export const useActions = (state: State, dispatch: Dispatch<Action>) => ({
  initTransactions: (history: TransactionHistoryItem[]) =>
    dispatch({ type: TransactionAction.INIT_TRANSACTIONS, value: history }),
  addTransaction: (response: TransactionResponse) =>
    dispatch({ type: TransactionAction.ADD_TRANSACTION, value: response }),
  addReceipt: (receipt: TransactionReceipt) =>
    dispatch({ type: TransactionAction.ADD_RECEIPT, value: receipt }),
});
