import { useContext, useMemo } from 'react';
import { get } from 'lodash';
import { utils } from 'ethers/lib.esm';
import { Asset } from 'models/asset';
import { BalanceContext } from 'context/BalanceContext';

export function useAssetBalance(asset: Asset, _owner: string) {
  const { balances } = useContext(BalanceContext);
  const owner = _owner?.toLowerCase();

  const value = useMemo(() => {
    return get(balances, [asset.chainId, owner, asset.id], '0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(balances), owner, asset]);

  return {
    value: utils.formatUnits(value, asset.decimals),
    weiValue: value,
    loading: false,
  };
}
