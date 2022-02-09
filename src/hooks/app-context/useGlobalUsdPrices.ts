import { AppContext } from 'context/AppContext';
import { priceFeeds } from 'controllers/price-feeds';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import { useCallback, useContext, useRef, useState } from 'react';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { listAssetsForChain } from 'utils/asset-utils';
import Logger from 'utils/Logger';
import { UsdPriceContext } from 'context/UsdPriceContext';

const interval = 210 * 1000; // 60 seconds

export function useGlobalUsdPrices(chainId: ChainId) {
  const isMounted = useIsMounted();
  const { isTestnet } = useContext(AppContext);
  const { execute: startPrices, initPrices } = useContext(UsdPriceContext);
  const [value, setValue] = useState({});
  const intervalRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async () => {
    try {
      startPrices();
      await priceFeeds.getAll(isTestnet).then(response => {
        if (isMounted()) {
          initPrices(response);
          setValue(response);
        }
      });
    } catch (e) {
      Logger.error(e, 'useGlobalUsdPrices');
    }
  }, [startPrices, isTestnet, isMounted, initPrices]);

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
