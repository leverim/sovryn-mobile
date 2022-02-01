import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { currentChainId } from 'utils/helpers';
import { getSwapExpectedReturn } from '.';

export const getUsdPrice = (
  amount: string,
  tokenId: TokenId,
  chainId: ChainId = currentChainId(),
) => {
  return getSwapExpectedReturn(tokenId, 'xusd', amount, chainId);
};
