import type {
  TransactionResponse,
  TransactionReceipt,
  TransactionRequest,
} from '@ethersproject/providers';

export enum TransactionAction {
  INIT_TRANSACTIONS,
  ADD_TRANSACTION,
  ADD_RECEIPT,
}

export type TransactionHistoryItem = {
  response: TransactionResponse;
  request?: TransactionRequest;
  receipt?: TransactionReceipt;
};

export type State = {
  transactions: TransactionHistoryItem[];
};

export type Action =
  | {
      type: TransactionAction.INIT_TRANSACTIONS;
      value: TransactionHistoryItem[];
    }
  | {
      type: TransactionAction.ADD_TRANSACTION;
      value: TransactionResponse;
    }
  | {
      type: TransactionAction.ADD_RECEIPT;
      value: TransactionReceipt;
    };
