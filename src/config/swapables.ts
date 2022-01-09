import { ChainId } from 'types/network';
import { TokenId } from 'types/token';

export const swapables: Partial<Record<ChainId, TokenId[]>> = {
  30: [
    'rbtc',
    'sov',
    'eths',
    'fish',
    'mynt',
    'doc',
    'rusdt',
    'xusd',
    'wrbtc',
    'bnbs',
  ],
};

export const wrapSwapables: Partial<Record<ChainId, [TokenId, TokenId]>> = {
  30: ['rbtc', 'wrbtc'],
};
