import { useCallback, useState } from 'react';
import { useWalletAddress } from 'hooks/useWalletAddress';
import Logger from 'utils/Logger';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_BORROW_LOAN_LIST } from 'utils/constants';
import {
  ActiveLoan,
  getActiveLoanList,
  LoanType,
} from 'utils/interactions/protocol';
import { useCurrentChain } from 'hooks/useCurrentChain';
import { useIsMounted } from 'hooks/useIsMounted';

const initialValue: Array<ActiveLoan> = [];

export const useActiveLoanList = (loanType: LoanType) => {
  const owner = useWalletAddress().toLowerCase();
  const { chainId } = useCurrentChain();
  const isMounted = useIsMounted();

  const [items, setItems] = useState(
    cache.get(STORAGE_CACHE_BORROW_LOAN_LIST, initialValue),
  );
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    console.log('execute1');
    if (!owner) {
      return;
    }
    console.log('why?');
    setLoading(true);
    try {
      const result = await getActiveLoanList(chainId, owner, loanType);

      console.log('what: ', result);

      cache.set(STORAGE_CACHE_BORROW_LOAN_LIST, result);

      if (isMounted()) {
        setItems(result);
      }
    } catch (e) {
      console.error(e);
      Logger.error(e, 'useBorrowPool execute');
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [owner, chainId, loanType, isMounted]);

  return {
    value: items,
    loading,
    execute,
  };
};
