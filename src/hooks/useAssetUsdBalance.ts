import { BigNumber, BigNumberish } from 'ethers';
import { useMemo } from 'react';
import { getSwappableToken } from 'config/swapables';
import { formatUnits } from 'utils/helpers';
import { useCachedUsdPrice } from './app-context/useCachedUsdPrice';
import { Asset } from 'models/asset';
import { findAsset, getUsdAsset } from 'utils/asset-utils';

export function useAssetUsdBalance(asset: Asset, amount?: BigNumberish) {
  const xusdPrice = useCachedUsdPrice(
    asset.chainId,
    asset.native
      ? findAsset(asset.chainId, getSwappableToken(asset.id, asset.chainId))
      : asset,
  );
  // todo: use correct chain id
  const xusdToken = getUsdAsset(30);

  const weiValue = useMemo(() => {
    if (!xusdToken) {
      return null;
    }

    if (asset.id === xusdToken.id) {
      return amount || '0';
    }

    if (xusdPrice !== null) {
      return BigNumber.from(amount || '0')
        .mul(xusdPrice)
        .div(xusdToken.ONE)
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
