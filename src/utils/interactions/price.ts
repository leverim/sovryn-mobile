import { AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { listAssetsForChain } from 'utils/asset-utils';
import { cache } from 'utils/cache';
import { USD_TOKEN } from 'utils/constants';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { currentChainId } from 'utils/helpers';
import { getNetworks } from 'utils/network-utils';
import { getSwapExpectedReturn } from '.';

export const getUsdPrice = (
  amount: string,
  tokenId: TokenId,
  chainId: ChainId = currentChainId(),
) => {
  return getSwapExpectedReturn(tokenId, USD_TOKEN, amount, chainId);
};

export const getAllBalances = (chainId: ChainId, owner: string) => {
  const { multicallContract } = getNetworks().find(
    item => item.chainId === chainId,
  )!;

  return aggregateCall<Record<TokenId, string>>(
    chainId,
    listAssetsForChain(chainId).map(
      item =>
        ({
          address: (item.type === AssetType.NATIVE
            ? multicallContract
            : item.address
          )?.toLowerCase(),
          fnName:
            item.type === AssetType.NATIVE
              ? 'getEthBalance(address)(uint256)'
              : 'balanceOf(address)(uint256)',
          args: [owner.toLowerCase()],
          key: item.id,
          parser: response => response[0].toString(),
        } as CallData),
    ),
  ).then(async ({ returnData }) => {
    await cache.set(`balances_${chainId}_${owner.toLowerCase()}`, returnData);
    return returnData;
  });
};

export const getCachedBalances = (chainId: ChainId, owner: string) => {
  return cache.get<Record<TokenId, string>>(
    `balances_${chainId}_${owner?.toLowerCase()}`,
    {} as Record<TokenId, string>,
  );
};

export const getCachedPrices = (chainId: ChainId, target: TokenId) => {
  return cache.get<Record<TokenId, string>>(
    `prices_${chainId}_${target}`,
    {} as Record<TokenId, string>,
  );
};

export const getCachedBalance = (
  chainId: ChainId,
  owner: string,
  tokenId: TokenId,
) => {
  const balances = getCachedBalances(chainId, owner);
  if (balances.hasOwnProperty(tokenId)) {
    return balances[tokenId];
  }
  return '0';
};

export const getCachedPrice = (
  chainId: ChainId,
  source: TokenId,
  target: TokenId,
) => {
  const prices = getCachedPrices(chainId, target);
  if (prices.hasOwnProperty(source)) {
    return prices[source];
  }
  return '0';
};
