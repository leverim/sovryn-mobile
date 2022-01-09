import { useCallback, useEffect, useMemo, useState } from 'react';
import { cache } from 'utils/cache';
import { contractCall } from 'utils/contract-utils';
import { useWalletAddress } from './useWalletAddress';

export function useCall<T = string>(
  chainId: number,
  to: string,
  methodAndTypes: string,
  args: any[],
  _default?: T,
) {
  const from = useWalletAddress();
  const key = useMemo(
    () => `call_${chainId}_${to}_${methodAndTypes}_${args.toString()}_${from}`,
    [chainId, to, methodAndTypes, args, from],
  );

  const [value, setValue] = useState<T>(cache.get(key, _default));
  const [loaded, setLoaded] = useState<boolean>(
    cache.get(`${key}_loaded`, false),
  );
  const [loading, setLoading] = useState<boolean>(true);

  const updateValue = useCallback(
    async (result: T) => {
      setValue(result);
      cache.set(key, result);
    },
    [key],
  );

  useEffect(() => {
    setLoading(true);
    contractCall<T>(chainId, to, methodAndTypes, args)
      .then(updateValue)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, to, methodAndTypes, JSON.stringify(args), updateValue]);

  return {
    value,
    loading,
    loaded,
  };
}
