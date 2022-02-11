import { useCallback, useContext, useRef, useState } from 'react';
import { intersection } from 'lodash';
import { AppContext } from 'context/AppContext';
import { priceFeeds } from 'controllers/price-feeds';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useIsMounted } from 'hooks/useIsMounted';
import Logger from 'utils/Logger';
import { UsdPriceContext } from 'context/UsdPriceContext';

const interval = 210 * 1000; // 3 minutes and 30 seconds

export function useGlobalUsdPrices() {
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
    if (intersection(chainIds, [30, 31]).length > 0) {
      await execute();
      intervalRef.current = setTimeout(executeInterval, interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, JSON.stringify(chainIds)]);

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
