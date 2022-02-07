import { swapables } from 'config/swapables';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { aggregateCall, contractCall } from 'utils/contract-utils';
import { getContractAddress, parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import { IPriceOracle, PriceOracleResult } from './price-oracle-interface';

const targetTokenId: TokenId = 'xusd';

class SovrynAmmOracle implements IPriceOracle {
  async getOne(
    chainId: ChainId,
    sourceTokenId: TokenId,
  ): Promise<PriceOracleResult> {
    const sourceToken = tokenUtils.getTokenById(sourceTokenId);
    const targetToken = tokenUtils.getTokenById(targetTokenId);

    return contractCall(
      chainId,
      getContractAddress('sovrynProtocol', chainId),
      'getSwapExpectedReturn(address,address,uint256)(uint256)',
      [
        sourceToken.address[chainId]?.toLowerCase(),
        targetToken.address[chainId]?.toLowerCase(),
        parseUnits('1', targetToken.decimals).toString(),
      ],
    ).then(response => ({
      tokenId: sourceTokenId,
      price: response[0].toString(),
      precision: parseUnits('1', targetToken.decimals).toString(),
    }));
  }

  async getAll(chainId: ChainId): Promise<PriceOracleResult[]> {
    const sovrynProtocolAddress = getContractAddress('sovrynProtocol', chainId);
    const targetToken = tokenUtils.getTokenById(targetTokenId);
    const targetAddress = targetToken.address[chainId]?.toLowerCase();
    const amountOne = parseUnits('1', targetToken.decimals).toString();

    const items =
      swapables[chainId]?.filter(
        item => item !== targetTokenId && item !== 'rbtc',
      ) || [];

    return aggregateCall<Record<TokenId, PriceOracleResult>>(
      chainId,
      items.map(item => ({
        address: sovrynProtocolAddress,
        fnName: 'getSwapExpectedReturn(address,address,uint256)(uint256)',
        args: [
          tokenUtils.getTokenAddressForId(item, chainId),
          targetAddress,
          amountOne,
        ],
        key: item,
        parser: response => ({
          tokenId: item,
          price: response[0].toString(),
          precision: amountOne,
        }),
      })),
    ).then(({ returnData }) =>
      Object.entries(returnData).reduce(
        (p, [_, result]) => [...p, result],
        [] as PriceOracleResult[],
      ),
    );
  }
}

export const sovrynAmmOracle = new SovrynAmmOracle();

export default sovrynAmmOracle;
