import { useContext, useMemo } from 'react';
import { get } from 'lodash';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { Prices, UsdPriceContext } from 'context/UsdPriceContext';
import { PriceOracleResult } from 'controllers/price-oracles/price-oracle-interface';
import { Asset } from 'models/asset';
import { getUsdAsset } from 'utils/asset-utils';

type SyncWith = Partial<
  Record<ChainId, Partial<Record<TokenId, [ChainId, TokenId, TokenId]>>>
>;

const syncWithAnotherNetwork: SyncWith = {
  1: {
    eth: [30, 'eths', 'xusd'],
    esov: [30, 'sov', 'xusd'],
  },
  30: {
    rbtc: [30, 'wrbtc', 'xusd'],
  },
  31: {
    trbtc: [31, 'twrbtc', 'txusd'],
  },
  56: {
    bnb: [30, 'bnbs', 'xusd'],
  },
  97: {
    tbnb: [31, 'tbnbs', 'txusd'],
  },
};

export function useCachedUsdPrice(chainId: ChainId, sourceToken: Asset) {
  const { prices } = useContext(UsdPriceContext);

  const price = useMemo(
    () => getCachedUsdPrice(prices, chainId, sourceToken)?.price || null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, sourceToken, JSON.stringify(prices)],
  );

  return price;
}

export const getUsdPrice = (
  prices: Prices,
  chainId: ChainId,
  sourceId: TokenId,
): PriceOracleResult | null => {
  const _prices = get(prices, [chainId], [] as PriceOracleResult[]);
  if (_prices.length) {
    const result = _prices.find(item => item.tokenId === sourceId);
    if (result) {
      return result;
    }
  }
  return null;
};

export const getCachedUsdPrice = (
  prices: Prices,
  chainId: ChainId,
  sourceToken: Asset,
): PriceOracleResult | null => {
  const token = getUsdAsset(chainId);
  if (token?.id === sourceToken.id) {
    return {
      price: token.ONE,
      precision: token.ONE,
      tokenId: token.id,
    };
  }
  const asset = get(syncWithAnotherNetwork, [chainId, sourceToken.id], null);
  if (asset !== null) {
    return getUsdPrice(prices, asset[0], asset[1]);
  }

  const currentChainPrice = getUsdPrice(prices, chainId, sourceToken.id);
  if (currentChainPrice !== null) {
    return currentChainPrice;
  }

  return null;
};
