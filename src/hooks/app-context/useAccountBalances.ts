import { AppContext } from 'context/AppContext';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef, useState } from 'react';
import { ChainId } from 'types/network';
import { getAllBalances, getCachedBalances } from 'utils/interactions/price';
import Logger from 'utils/Logger';

const interval = 30 * 1000; // 60 seconds

export function useAccountBalances(chainId: ChainId, owner: string) {
  const isMounted = useIsMounted();
  owner = owner?.toLowerCase();
  const { balances, setBalances } = useContext(AppContext);
  const [value, setValue] = useState(
    balances[chainId]?.[owner] || getCachedBalances(chainId, owner!),
  );
  const intervalRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    if (!owner) {
      return;
    }
    try {
      await getAllBalances(chainId, owner).then(response => {
        if (isMounted()) {
          setBalances(chainId, owner, response);
          setValue(response);
        }
      });
    } catch (e) {
      Logger.error(e, 'useAccountBalances');
    }
  }, [chainId, owner, setBalances, isMounted]);

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
