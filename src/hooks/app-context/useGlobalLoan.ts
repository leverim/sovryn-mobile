import { lendingTokens } from 'config/lending-tokens';
import { AppContext } from 'context/AppContext';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef, useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { getLoanTokenInfo, LoanTokenInfo } from 'utils/interactions/loan-token';
import Logger from 'utils/Logger';

const interval = 30 * 1000; // 60 seconds

export function useGlobalLoan(chainId: ChainId, owner: string) {
  const isMounted = useIsMounted();
  owner = owner?.toLowerCase();
  const { loanPools, setLoanPools } = useContext(AppContext);
  const [value, setValue] = useState<Partial<Record<TokenId, LoanTokenInfo>>>(
    loanPools[chainId]?.[owner] || {},
  );
  const intervalRef = useRef<NodeJS.Timeout>();

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
        }
      });
    } catch (e) {
      Logger.error(e, 'useAccountBalances');
    }
  }, [chainId, owner, setLoanPools, isMounted]);

  const executeInterval = useCallback(async () => {
    if ([30, 31].includes(chainId)) {
      await execute();
      intervalRef.current = setTimeout(executeInterval, interval);
    }
  }, [execute, chainId]);

  useDebouncedEffect(
    () => {
      executeInterval();
      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    },
    300,
    [executeInterval],
  );

  return {
    value,
    execute,
  };
}
