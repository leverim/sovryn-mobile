import { tokens } from 'config/tokens';
import { ChainId } from 'types/network';
import type { TokenId, Token } from 'types/token';
import { currentChainId } from './helpers';

export const tokenUtils = {
  listTokens: (): Token[] => {
    return tokens;
  },
  listTokensForChainId: (chainId: ChainId): Token[] => {
    return tokens.filter(item => item.address[chainId]);
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
  getNativeToken: (chainId: ChainId): Token => {
    return tokenUtils
      .listTokensForChainId(chainId)
      .find(item => item.native) as Token;
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
};
