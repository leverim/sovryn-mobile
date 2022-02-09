import { useCallback, useContext, useMemo } from 'react';
import { get } from 'lodash';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { USD_TOKEN } from 'utils/constants';
import { UsdPriceContext } from 'context/UsdPriceContext';
import { cache } from 'utils/cache';
import { PriceOracleResult } from 'controllers/price-oracles/price-oracle-interface';

type SyncWith = Partial<
  Record<ChainId, Partial<Record<TokenId, [ChainId, TokenId, TokenId]>>>
>;

const syncWithAnotherNetwork: SyncWith = {
  1: {
    eth: [30, 'eths', USD_TOKEN],
    esov: [30, 'sov', USD_TOKEN],
  },
  56: {
    bnb: [30, 'bnbs', USD_TOKEN],
  },
  97: {
    bnb: [31, 'bnbs', USD_TOKEN],
  },
};

export function useCachedUsdPrice(
  chainId: ChainId,
  sourceId: TokenId,
  targetId: TokenId = USD_TOKEN,
) {
  const { prices } = useContext(UsdPriceContext);

  const getUsdPrice = useCallback(
    (_chainId: ChainId, _targetId: TokenId, _sourceId: TokenId) => {
      const _prices = get(prices, [_chainId], [] as PriceOracleResult[]);
      if (_prices.length) {
        const result = _prices.find(item => item.tokenId === _sourceId);
        if (result) {
          return result.price;
        }
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(prices)],
  );

  const price = useMemo(() => {
    const asset = get(syncWithAnotherNetwork, [chainId, sourceId], null);
    if (asset !== null) {
      return getUsdPrice(asset[0], asset[2], asset[1]);
    }

    const currentChainPrice = getUsdPrice(chainId, targetId, sourceId);
    if (currentChainPrice !== null) {
      return currentChainPrice;
    }

    return null;
  }, [chainId, sourceId, targetId, getUsdPrice]);

  return price;
}
