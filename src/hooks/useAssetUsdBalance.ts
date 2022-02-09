import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { getSwappableToken } from 'config/swapables';
import { USD_TOKEN } from 'utils/constants';
import { formatUnits, parseUnits } from 'utils/helpers';
import { useCachedUsdPrice } from './app-context/useCachedUsdPrice';
import { Asset } from 'models/asset';
import { findAsset } from 'utils/asset-utils';

export function useAssetUsdBalance(asset: Asset, amount: string) {
  const xusdPrice = useCachedUsdPrice(
    asset.chainId,
    asset.native ? getSwappableToken(asset.id, asset.chainId) : asset.id,
  );
  // todo: use correct chain id
  const xusdToken = findAsset(30, USD_TOKEN);

  const weiValue = useMemo(() => {
    if (!xusdToken) {
      return null;
    }

    if (asset.id === xusdToken.id) {
      return amount || '0';
    }

    if (xusdPrice !== null) {
      return BigNumber.from(amount)
        .mul(xusdPrice)
        .div(parseUnits('1', xusdToken.decimals))
        .toString();
    }
    return null;
  }, [asset.id, xusdToken, xusdPrice, amount]);

  return {
    weiValue,
    value: weiValue !== null ? formatUnits(weiValue, xusdToken.decimals) : null,
    token: xusdToken,
    price: xusdPrice,
  };
}
