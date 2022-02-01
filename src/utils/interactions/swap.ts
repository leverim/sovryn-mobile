import { getSwappableToken } from 'config/swapables';
import { TokenId } from 'types/token';
import { callToContract } from 'utils/contract-utils';
import { currentChainId, formatUnits, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { ChainId } from 'types/network';

export const getSwapExpectedReturn = (
  sendToken: TokenId,
  receiveToken: TokenId,
  sendAmount: string,
  chainId: ChainId = currentChainId(),
) => {
  return callToContract(
    'sovrynProtocol',
    'getSwapExpectedReturn(address,address,uint256)(uint256)',
    [
      tokenUtils.getTokenAddressForId(getSwappableToken(sendToken, chainId)),
      tokenUtils.getTokenAddressForId(getSwappableToken(receiveToken, chainId)),
      parseUnits(sendAmount, tokenUtils.getTokenById(sendToken).decimals),
    ],
  )
    .then(response =>
      formatUnits(response[0], tokenUtils.getTokenById(receiveToken).decimals),
    )
    .catch(() => '0');
};
