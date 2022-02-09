import { assets } from 'config/assets';
import { Asset, AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { getNetworkIds } from './network-utils';

export const listAssets = (isTestnet: boolean): Asset[] =>
  assets.filter(item => getNetworkIds(isTestnet).includes(item.chainId));

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
