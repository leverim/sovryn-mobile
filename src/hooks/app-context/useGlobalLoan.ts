import { useCallback, useContext, useRef } from 'react';
import { AppContext } from 'context/AppContext';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useGlobalLoans } from './useGlobalLoans';

const interval = 60 * 1000; // 60 seconds

export function useGlobalLoan(owner: string) {
  const { isTestnet } = useContext(AppContext);

  const chainId = isTestnet ? 31 : 30;

  const { value, execute } = useGlobalLoans(owner);
  const intervalRef = useRef<NodeJS.Timeout>();

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
