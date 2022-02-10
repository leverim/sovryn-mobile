import { AppContext } from 'context/AppContext';
import { priceFeeds } from 'controllers/price-feeds';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef, useState } from 'react';
import { ChainId } from 'types/network';
import Logger from 'utils/Logger';
import { UsdPriceContext } from 'context/UsdPriceContext';

const interval = 210 * 1000; // 3 minutes and 30 seconds

export function useGlobalUsdPrices(chainId: ChainId) {
  const isMounted = useIsMounted();
  const { chainIds } = useContext(AppContext);
  const { execute: startPrices, initPrices } = useContext(UsdPriceContext);
  const [value, setValue] = useState({});
  const intervalRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    try {
      startPrices();
      await priceFeeds.getAll(chainIds).then(response => {
        if (isMounted()) {
          initPrices(response);
          setValue(response);
        }
      });
    } catch (e) {
      Logger.error(e, 'useGlobalUsdPrices');
    }
  }, [startPrices, chainIds, isMounted, initPrices]);

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
