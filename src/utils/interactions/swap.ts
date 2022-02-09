import { getSwappableToken } from 'config/swapables';
import { TokenId } from 'types/asset';
import { callToContract } from 'utils/contract-utils';
import { currentChainId, formatUnits, parseUnits } from 'utils/helpers';
import { ChainId } from 'types/network';
import { findAsset } from 'utils/asset-utils';

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
      findAsset(chainId, getSwappableToken(sendToken, chainId)).address,
      findAsset(chainId, getSwappableToken(receiveToken, chainId)).address,
      parseUnits(sendAmount, findAsset(chainId, sendToken).decimals),
    ],
  )
    .then(response =>
      formatUnits(response[0], findAsset(chainId, receiveToken).decimals),
    )
    .catch(() => '0');
};
