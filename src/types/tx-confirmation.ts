import type { TransactionRequest } from '@ethersproject/abstract-provider';

export type TransactionModalDataProps = {
  loading: boolean;
  request: TransactionRequest;
  onEditRequested: () => void;
  onLoaderFunction: (value: Promise<any>) => void;
};
