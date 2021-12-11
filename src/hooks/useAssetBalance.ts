import { useEffect, useState } from 'react';
import { utils } from 'ethers/lib.esm';
import { Asset, getAssetNetwork } from 'utils/assets';
import { EvmNetwork } from 'utils/networks';
import { contractCall } from 'utils/contract-utils';
import { getProvider } from 'utils/RpcEngine';

export function useAssetBalance(asset: Asset, owner: string) {
  const network = getAssetNetwork(asset.id) as EvmNetwork;

  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);

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
          .then(result => setBalance(result.toString()))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        getProvider(network.chainId)
          .getBalance(owner)
          .then(result => setBalance(result.toString()))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }
  }, [network, asset, owner]);

  return {
    value: utils.formatUnits(balance, asset.decimals),
    loading,
  };
}
