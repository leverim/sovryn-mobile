import { assets } from 'config/assets';
import { Asset, AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';

export const listAssetsForChains = (chainIds: ChainId[]): Asset[] =>
  assets.filter(item => chainIds.includes(item.chainId));

export const listAssetsForChain = (chainId: ChainId): Asset[] =>
  assets.filter(item => item.chainId === chainId);

export const findAsset = (chainId: ChainId, tokenId: TokenId): Asset =>
  listAssetsForChain(chainId).find(item => item.id === tokenId)!;

export const findAssetByAddress = (chainId: ChainId, address: string): Asset =>
  listAssetsForChain(chainId).find(
    item => item.address === address.toLowerCase(),
  )!;

export const getNativeAsset = (chainId: ChainId): Asset =>
  listAssetsForChain(chainId).find(item => item.type === AssetType.NATIVE)!;

export const getUsdAsset = (chainId: ChainId): Asset => {
  switch (chainId) {
    case 30:
      return findAsset(30, 'xusd');
    case 31:
      return findAsset(31, 'txusd');
    default:
      return undefined!;
  }
};

export const getSovAsset = (chainId: ChainId): Asset => {
  switch (chainId) {
    case 30:
      return findAsset(30, 'sov');
    case 31:
      return findAsset(31, 'tsov');
    default:
      return undefined!;
  }
};
