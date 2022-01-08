import { tokens } from 'config/tokens';
import type { TokenId, Token } from 'types/token';

export const tokenUtils = {
  listTokens: (): Token[] => {
    return tokens;
  },
  listTokensForChainId: (chainId: number): Token[] => {
    return tokens.filter(item => item.address[chainId]);
  },
  getTokenById: (tokenId: TokenId): Token => {
    return tokens.find(item => item.id === tokenId) as Token;
  },
  getTokenAddressForChainId: (token: Token, chainId: number) => {
    return token.address[chainId]?.toLowerCase();
  },
  tokenHasChainId: (token: Token, chainId: number) => {
    return token.address.hasOwnProperty(chainId);
  },
  getNativeToken: (chainId: number): Token => {
    return tokenUtils
      .listTokensForChainId(chainId)
      .find(item => item.native) as Token;
  },
};
