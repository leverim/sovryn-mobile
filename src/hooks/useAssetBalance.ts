import { useCallback, useEffect, useState } from 'react';
import { utils } from 'ethers/lib.esm';
import { Asset, getAssetNetwork } from 'utils/assets';
import { EvmNetwork } from 'utils/networks';
import { contractCall } from 'utils/contract-utils';
import { getProvider } from 'utils/RpcEngine';
import { cache } from 'utils/cache';

export function useAssetBalance(asset: Asset, owner: string) {
  const network = getAssetNetwork(asset.id) as EvmNetwork;

  const key = `asset_balance_${asset.id}`;

  const [balance, setBalance] = useState<string>(cache.get(key, '0'));
  const [loading, setLoading] = useState<boolean>(true);

  const updateBalance = useCallback(
    (value: string) => {
      setBalance(value);
      cache.set(key, value);
    },
    [setBalance, key],
  );

  useEffect(() => {
    setLoading(true);
    if (network.evm) {
      if (asset.address) {
        contractCall(
          network.chainId,
          asset.address,
          'balanceOf(address)(uint256)',
          [owner],
        )
          .then(result => updateBalance(result.toString()))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        getProvider(network.chainId)
          .getBalance(owner)
          .then(result => updateBalance(result.toString()))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }
  }, [network, asset, owner, updateBalance]);

  return {
    value: utils.formatUnits(balance, asset.decimals),
    loading,
  };
}
