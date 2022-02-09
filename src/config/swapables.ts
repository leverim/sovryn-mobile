import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';

export const swapables: Partial<Record<ChainId, TokenId[]>> = {
  30: [
    'rbtc',
    'wrbtc',
    'sov',
    'eths',
    'fish',
    'mynt',
    'doc',
    'rusdt',
    'xusd',
    'bnbs',
  ],
  31: [
    'rbtc',
    'wrbtc',
    'sov',
    'eths',
    'fish',
    'mynt',
    'doc',
    'rusdt',
    'xusd',
    'bnbs',
  ],
};

export const wrapSwapables: Partial<Record<ChainId, [TokenId, TokenId]>> = {
  30: ['rbtc', 'wrbtc'],
  31: ['rbtc', 'wrbtc'],
};

export const getSwappableToken = (
  tokenId: TokenId,
  chainId: ChainId,
): TokenId => {
  if (
    wrapSwapables.hasOwnProperty(chainId) &&
    wrapSwapables[chainId]?.[0] === tokenId
  ) {
    return wrapSwapables[chainId]![1];
  }
  return tokenId;
};

export const unwrapSwappableToken = (
  tokenId: TokenId,
  chainId: ChainId,
): TokenId => {
  if (
    wrapSwapables.hasOwnProperty(chainId) &&
    wrapSwapables[chainId]?.[1] === tokenId
  ) {
    return wrapSwapables[chainId]![0];
  }
  return tokenId;
};
