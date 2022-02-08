import { assets, tokens } from 'config/tokens';
import { intersection } from 'lodash';
import { Asset, AssetType } from 'models/asset';
import { ChainId } from 'types/network';
import type { TokenId, Token } from 'types/token';
import { currentChainId } from './helpers';
import { getNetworkIds } from './network-utils';

export const tokenUtils = {
  listTokens: (): Token[] => {
    return tokens;
  },
  listForNetwork: (isTestnet: boolean): Token[] => {
    return tokens.filter(item =>
      intersection(
        Object.keys(item.address) as unknown as ChainId[],
        getNetworkIds(isTestnet) as unknown as ChainId[],
      ),
    );
  },
  listTokensForChainId: (chainId: ChainId): Asset[] => {
    return assets.filter(item => item.chainId === chainId);
  },
  getTokenById: (tokenId: TokenId): Token => {
    return tokens.find(item => item.id === tokenId) as Token;
  },
  getTokenAddressForChainId: (token: Token, chainId: ChainId) => {
    return token.address[chainId]?.toLowerCase()!;
  },
  tokenHasChainId: (token: Token, chainId: ChainId) => {
    return token.address.hasOwnProperty(chainId);
  },
  getNativeToken: (chainId: ChainId): Asset => {
    return tokenUtils
      .listTokensForChainId(chainId)
      .find(item => item.type === AssetType.NATIVE) as Asset;
  },
  getTokenAddressForId: (
    tokenId: TokenId,
    chainId: ChainId = currentChainId(),
  ) => {
    return tokenUtils.getTokenAddressForChainId(
      tokenUtils.getTokenById(tokenId),
      chainId,
    );
  },
  getTokenByAddress: (address: string, chainId: ChainId = currentChainId()) => {
    return tokens.find(
      item => item.address[chainId]?.toLowerCase() === address.toLowerCase(),
    ) as Token;
  },
};
