import { useCallback, useContext, useState } from 'react';
import { set } from 'lodash';
import { lendingTokens } from 'config/lending-tokens';
import { AppContext } from 'context/AppContext';
import { useIsMounted } from 'hooks/useIsMounted';
import { TokenId } from 'types/asset';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_LOAN_POOLS } from 'utils/constants';
import { getLoanTokenInfo, LoanTokenInfo } from 'utils/interactions/loan-token';
import Logger from 'utils/Logger';

export function useGlobalLoans(owner: string) {
  const isMounted = useIsMounted();
  owner = owner?.toLowerCase();
  const { isTestnet, loanPools, setLoanPools } = useContext(AppContext);

  const chainId = isTestnet ? 31 : 30;

  const [value, setValue] = useState<Partial<Record<TokenId, LoanTokenInfo>>>(
    loanPools?.[chainId]?.[owner] || {},
  );

  const execute = useCallback(async () => {
    if (!owner) {
      return;
    }
    try {
      const pools = lendingTokens
        .filter(item => item.chainId === chainId)
        .map(pool =>
          getLoanTokenInfo(pool, owner).then(item => ({
            tokenId: pool.loanTokenId,
            result: item,
          })),
        );

      await Promise.all(pools).then(response => {
        if (isMounted()) {
          const items = response.reduce((p, c) => {
            p[c.tokenId] = c.result;
            return p;
          }, {} as Record<TokenId, LoanTokenInfo>);
          setLoanPools(chainId, owner, items);
          setValue(items);
          const cached = cache.get(STORAGE_CACHE_LOAN_POOLS, {});
          cache.set(
            STORAGE_CACHE_LOAN_POOLS,
            set(cached, [chainId, owner], items),
          );
        }
      });
    } catch (e) {
      Logger.error(e, 'useAccountBalances');
    }
  }, [chainId, owner, setLoanPools, isMounted]);

  return {
    value,
    execute,
  };
}
