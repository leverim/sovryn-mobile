import { TokenId } from 'types/asset';
import { ChainId } from 'types/network';

type WrappedAssets = Partial<Record<ChainId, [TokenId, TokenId]>>;

export const wrappedAssets: WrappedAssets = {
  30: ['rbtc', 'wrbtc'],
  31: ['trbtc', 'twrbtc'],
};
