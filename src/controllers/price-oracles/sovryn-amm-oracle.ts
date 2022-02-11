import { swapables } from 'config/swapables';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset, getNativeAsset } from 'utils/asset-utils';
import { aggregateCall, contractCall } from 'utils/contract-utils';
import { getContractAddress, parseUnits } from 'utils/helpers';
import { IPriceOracle, PriceOracleResult } from './price-oracle-interface';

const targetTokenId: Partial<Record<ChainId, TokenId>> = {
  30: 'xusd',
  31: 'txusd',
};

class SovrynAmmOracle implements IPriceOracle {
  async getOne(
    chainId: ChainId,
    sourceTokenId: TokenId,
  ): Promise<PriceOracleResult> {
    const sourceToken = findAsset(chainId, sourceTokenId);
    const targetToken = findAsset(chainId, targetTokenId[chainId]!);

    return contractCall(
      chainId,
      getContractAddress('sovrynProtocol', chainId),
      'getSwapExpectedReturn(address,address,uint256)(uint256)',
      [
        sourceToken.address,
        targetToken.address,
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
    const targetToken = findAsset(chainId, targetTokenId[chainId]!);
    const targetAddress = targetToken.address;
    const amountOne = parseUnits('1', targetToken.decimals).toString();

    const items =
      swapables[chainId]?.filter(
        item =>
          item !== targetTokenId[chainId] &&
          item !== getNativeAsset(chainId).id,
      ) || [];

    return aggregateCall<Record<TokenId, PriceOracleResult>>(
      chainId,
      items.map(item => ({
        address: sovrynProtocolAddress,
        fnName: 'getSwapExpectedReturn(address,address,uint256)(uint256)',
        args: [findAsset(chainId, item).address, targetAddress, amountOne],
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
