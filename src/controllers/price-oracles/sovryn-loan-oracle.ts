import { BigNumber } from 'ethers';
import { lendingTokens } from 'config/lending-tokens';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { aggregateCall, CallData } from 'utils/contract-utils';
import { getContractAddress, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { IPriceOracle, PriceOracleResult } from './price-oracle-interface';
import { getSwappableToken, swapables } from 'config/swapables';

const targetTokenId: TokenId = 'xusd';

class SovrynLoanOracle implements IPriceOracle {
  async getOne(
    chainId: ChainId,
    sourceTokenId: TokenId,
  ): Promise<PriceOracleResult> {
    const targetToken = tokenUtils.getTokenById(targetTokenId);

    const loanToken = lendingTokens.find(
      item => item.chainId === chainId && item.loanTokenId === sourceTokenId,
    )!;

    const swapp = tokenUtils.getTokenAddressForId(
      getSwappableToken(loanToken.supplyTokenId, chainId),
      chainId,
    );

    const calls: CallData[] = [
      {
        address: loanToken.loanToken.address[chainId]?.toLowerCase()!,
        fnName: 'tokenPrice()(uint256)',
        args: [],
        key: 'tokenPrice',
        parser: response => response[0],
      },
    ];

    if (loanToken.supplyTokenId !== targetTokenId) {
      calls.push({
        address: getContractAddress('sovrynProtocol', chainId),
        fnName: 'getSwapExpectedReturn(address,address,uint256)(uint256)',
        args: [
          swapp,
          targetToken.address[chainId]?.toLowerCase(),
          parseUnits('1', targetToken.decimals).toString(),
        ],
        key: 'getSwapExpectedReturn',
        parser: response => response[0],
      });
    }

    const amountOne = parseUnits('1', targetToken.decimals).toString();

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
