import { useContext, useMemo } from 'react';
import { TransactionContext } from 'store/transactions';

export function useSelectTransaction(hash: string) {
  const { state } = useContext(TransactionContext);

  return useMemo(
    () => state.transactions.find(item => item.response.hash === hash)!,
    [state.transactions, hash],
  );
}
