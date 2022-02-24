import { useCallback, useContext, useMemo, useState } from 'react';
import { AppContext } from 'context/AppContext';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { LendingToken } from 'models/lending-token';
import { getLoanTokenInfo } from 'utils/interactions/loan-token';
import Logger from 'utils/Logger';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_LOAN_POOLS } from 'utils/constants';
import { get, set } from 'lodash';

export function useLendingPool(lendingToken: LendingToken) {
  const { loanPools, setLoanPools } = useContext(AppContext);

  const owner = useWalletAddress().toLowerCase();

  const [loading, setLoading] = useState(false);

  const pool = useMemo(() => {
    return loanPools[lendingToken.chainId]?.[owner][lendingToken.loanTokenId]!;
  }, [lendingToken.chainId, lendingToken.loanTokenId, loanPools, owner]);

  const execute = useCallback(async () => {
    if (!owner) {
      return;
    }
    setLoading(true);
    try {
      const result = await getLoanTokenInfo(lendingToken, owner);
      const cached = cache.get(STORAGE_CACHE_LOAN_POOLS, {});

      cache.set(
        STORAGE_CACHE_LOAN_POOLS,
        set(
          cached,
          [lendingToken.chainId, owner, lendingToken.loanTokenId],
          result,
        ),
      );

      setLoanPools(
        lendingToken.chainId,
        owner,
        get(cache.get(STORAGE_CACHE_LOAN_POOLS, {}), [
          lendingToken.chainId,
          owner,
        ]),
      );
    } catch (e) {
      Logger.error(e, 'useLendingPool execute');
    } finally {
      setLoading(false);
    }
  }, [owner, lendingToken, setLoanPools]);

  return {
    value: pool,
    loading,
    execute,
  };
}
