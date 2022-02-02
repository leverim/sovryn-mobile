import { useContext, useMemo } from 'react';
import { AppContext } from 'context/AppContext';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { getCachedPrices } from 'utils/interactions/price';
import { USD_TOKEN } from 'utils/constants';

export function useCachedUsdPrice(
  chainId: ChainId,
  sourceId: TokenId,
  targetId: TokenId = USD_TOKEN,
) {
  const { prices } = useContext(AppContext);

  const price = useMemo(() => {
    if (
      prices.hasOwnProperty(chainId) &&
      prices[chainId]?.hasOwnProperty(sourceId)
    ) {
      return prices[chainId]?.[sourceId] || '0';
    }
    const cached = getCachedPrices(chainId, targetId);
    if (cached.hasOwnProperty(sourceId)) {
      return cached[sourceId] || '0';
    }

    return null;
  }, [prices, chainId, sourceId, targetId]);

  return price;
}
