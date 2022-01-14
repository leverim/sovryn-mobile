import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getSwappableToken } from 'config/swapables';
import { TokenId } from 'types/token';
import { callToContract } from 'utils/contract-utils';
import { currentChainId } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';

export const getSwapExpectedReturn = (
  sendToken: TokenId,
  receiveToken: TokenId,
  sendAmount: string,
) => {
  const chainId = currentChainId();
  return callToContract(
    'sovrynProtocol',
    'getSwapExpectedReturn(address,address,uint256)(uint256)',
    [
      tokenUtils.getTokenAddressForId(getSwappableToken(sendToken, chainId)),
      tokenUtils.getTokenAddressForId(getSwappableToken(receiveToken, chainId)),
      parseUnits(
        sendAmount || '0',
        tokenUtils.getTokenById(sendToken).decimals,
      ),
    ],
  ).then(response =>
    formatUnits(response[0], tokenUtils.getTokenById(receiveToken).decimals),
  );
};
