import { AppContext } from 'context/AppContext';
import { BalanceContext } from 'context/BalanceContext';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef } from 'react';
import { getAllBalances } from 'utils/interactions/price';
import Logger from 'utils/Logger';

const interval = 30 * 1000; // 30 seconds

export function useAccountBalances(owner: string) {
  const { chainIds } = useContext(AppContext);
  const { execute: startBalances, setBalances } = useContext(BalanceContext);
  const isMounted = useIsMounted();
  owner = owner?.toLowerCase();

  const intervalRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    if (!owner) {
      return;
    }
    try {
      startBalances();
      for (const chainId of chainIds) {
        await getAllBalances(chainId, owner)
          .then(response => {
            if (isMounted()) {
              setBalances(chainId, owner, response);
            }
          })
          .catch(e => Logger.error(e, 'getAllBalances'));
      }
    } catch (e) {
      Logger.error(e, 'useAccountBalances');
    }
  }, [owner, startBalances, chainIds, isMounted, setBalances]);

  const executeInterval = useCallback(async () => {
    await execute();
    intervalRef.current = setTimeout(executeInterval, interval);
  }, [execute]);

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
    execute,
  };
}
