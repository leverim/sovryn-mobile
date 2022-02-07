import { AppContext } from 'context/AppContext';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef, useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { getAllPrices, getCachedPrices } from 'utils/interactions/price';
import Logger from 'utils/Logger';

const interval = 60 * 1000; // 60 seconds

export function useGlobalUsdPrices(chainId: ChainId, tokenId: TokenId) {
  const isMounted = useIsMounted();
  const { prices, setPrices } = useContext(AppContext);
  const [value, setValue] = useState(
    prices[chainId] || getCachedPrices(chainId, tokenId),
  );
  const intervalRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    try {
      await getAllPrices(chainId, tokenId).then(response => {
        if (isMounted()) {
          setPrices(chainId, response);
          setValue(response);
        }
      });
    } catch (e) {
      Logger.error(e, 'useGlobalUsdPrices');
    }
  }, [chainId, setPrices, tokenId, isMounted]);

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
