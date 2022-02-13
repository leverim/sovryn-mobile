import { BigNumber } from 'ethers';
import { lendingTokens } from 'config/lending-tokens';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getContractAddress } from 'utils/helpers';
import { IPriceOracle, PriceOracleResult } from './price-oracle-interface';
import { getSwappableToken, swapables } from 'config/swapables';
import { findAsset } from 'utils/asset-utils';

const targetTokenId: Partial<Record<ChainId, TokenId>> = {
  30: 'xusd',
  31: 'txusd',
};

class SovrynLoanOracle implements IPriceOracle {
  async getOne(
    chainId: ChainId,
    sourceTokenId: TokenId,
  ): Promise<PriceOracleResult> {
    const targetToken = findAsset(chainId, targetTokenId[chainId]!);

    const loanToken = lendingTokens.find(
      item => item.chainId === chainId && item.loanTokenId === sourceTokenId,
    )!;

    const swapp = findAsset(
      chainId,
      getSwappableToken(loanToken.supplyTokenId, chainId),
    );

    const calls: CallData[] = [
      {
        address: loanToken.loanToken.address,
        fnName: 'tokenPrice()(uint256)',
        args: [],
        key: 'tokenPrice',
        parser: response => response[0],
      },
    ];

    if (loanToken.supplyTokenId !== targetTokenId[chainId]) {
      calls.push({
        address: getContractAddress('sovrynProtocol', chainId),
        fnName: 'getSwapExpectedReturn(address,address,uint256)(uint256)',
        args: [swapp.address, targetToken.address, swapp.ONE],
        key: 'getSwapExpectedReturn',
        parser: response => response[0],
      });
    }

    const amountOne = targetToken.ONE;

    return aggregateCall<
      Record<'tokenPrice' | 'getSwapExpectedReturn', BigNumber>
    >(chainId, calls).then(({ returnData }) => {
      return {
        tokenId: sourceTokenId,
        price: returnData.tokenPrice
          .mul(returnData?.getSwapExpectedReturn || amountOne)
          .div(amountOne)
          .toString(),
        precision: amountOne,
      };
    });
  }

  async getAll(chainId: ChainId): Promise<PriceOracleResult[]> {
    const items = lendingTokens
      .filter(item => item.chainId === chainId)
      .filter(item => swapables[chainId]?.includes(item.supplyTokenId))
      .map(item => item.loanTokenId);
    return Promise.all(items.map(item => this.getOne(chainId, item)));
  }
}

export const sovrynLoanOracle = new SovrynLoanOracle();

export default sovrynLoanOracle;
