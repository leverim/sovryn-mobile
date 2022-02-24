import { useCallback, useContext, useMemo, useState } from 'react';
import { get, set } from 'lodash';
import { utils } from 'ethers/lib.esm';
import { Asset } from 'models/asset';
import { BalanceContext } from 'context/BalanceContext';
import { getProvider } from 'utils/RpcEngine';
import { contractCall } from 'utils/contract-utils';
import { useIsMounted } from './useIsMounted';
import { cache } from 'utils/cache';
import { STORAGE_CACHE_BALANCES } from 'utils/constants';
import Logger from 'utils/Logger';

export function useAssetBalance(asset: Asset, _owner: string) {
  const { balances, loading, loaded, setBalance } = useContext(BalanceContext);
  const owner = _owner?.toLowerCase();
  const [_loading, setLoading] = useState(false);
  const isMounted = useIsMounted();

  const value = useMemo(() => {
    return get(balances, [asset.chainId, owner, asset.id], '0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(balances), owner, asset]);

  const execute = useCallback(async () => {
    setLoading(true);
    const request = asset.native
      ? getProvider(asset.chainId).getBalance(owner)
      : contractCall(
          asset.chainId,
          asset.address,
          'balanceOf(address)(uint256)',
          [owner],
        );
    request
      .then(result => result.toString())
      .then(result => {
        const cached = cache.get(STORAGE_CACHE_BALANCES, {});
        cache.set(
          STORAGE_CACHE_BALANCES,
          set(cached, [asset.chainId, owner, asset.id], result),
        );
        setBalance(asset.chainId, owner, asset.id, result);
      })
      .catch(error => {
        Logger.error(error, 'execute single balance retrieval.');
      })
      .finally(() => {
        if (isMounted()) {
          setLoading(false);
        }
      });
  }, [
    asset.address,
    asset.chainId,
    asset.id,
    asset.native,
    isMounted,
    owner,
    setBalance,
  ]);

  return {
    value: utils.formatUnits(value, asset.decimals),
    weiValue: value,
    loading: _loading || (loading && !loaded),
    execute,
  };
}
