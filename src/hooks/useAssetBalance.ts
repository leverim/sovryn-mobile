import { useCallback, useEffect, useState } from 'react';
import { utils } from 'ethers/lib.esm';
import { getProvider } from 'utils/RpcEngine';
import { cache } from 'utils/cache';
import { Token } from 'types/token';
import { currentChainId } from 'utils/helpers';
import { erc20 } from 'utils/interactions';
import { tokenUtils } from 'utils/token-utils';
import { useNavigation } from '@react-navigation/native';
import { ChainId } from 'types/network';

export function useAssetBalance(
  asset: Token,
  owner: string,
  chainId: ChainId = currentChainId(),
) {
  const navigation = useNavigation();
  const address = tokenUtils.getTokenAddressForChainId(asset, chainId);
  const key = `asset_balance_${address}_${owner}`;

  const [balance, setBalance] = useState<string>(cache.get(key, '0'));
  const [loading, setLoading] = useState<boolean>(true);

  const updateBalance = useCallback(
    (value: string) => {
      setBalance(value);
      cache.set(key, value);
    },
    [setBalance, key],
  );

  const getBalance = useCallback(() => {
    setLoading(true);
    if (address && !asset.native) {
      erc20
        .getBalance(chainId, address, owner)
        .then(result => updateBalance(result.toString()))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      getProvider(chainId)
        .getBalance(owner)
        .then(result => updateBalance(result.toString()))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [address, chainId, asset, owner, updateBalance]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', getBalance);
    return unsubscribe;
  }, [navigation, getBalance]);

  return {
    value: utils.formatUnits(balance, asset.decimals),
    loading,
  };
}
