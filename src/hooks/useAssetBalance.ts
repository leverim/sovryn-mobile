import { useContext, useMemo } from 'react';
import { utils } from 'ethers/lib.esm';
import { Asset } from 'models/asset';
import { AppContext } from 'context/AppContext';
import { get } from 'lodash';

export function useAssetBalance(asset: Asset, _owner: string) {
  const { balances } = useContext(AppContext);
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
