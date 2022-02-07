import { BigNumber } from 'ethers';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { parseUnits } from 'utils/helpers';
import { tokenUtils } from 'utils/token-utils';
import {
  IPriceOracle,
  PriceOracleResult,
} from './price-oracles/price-oracle-interface';
import sovrynAmmOracle from './price-oracles/sovryn-amm-oracle';
import sovrynLoanOracle from './price-oracles/sovryn-loan-oracle';

class PriceFeeds {
  private items: Partial<Record<ChainId, PriceOracleResult[]>> = {};

  constructor(protected oracles: IPriceOracle[] = []) {}

  public async getAll(chainId: ChainId) {
    const result = await Promise.all(
      this.oracles.map(item => item.getAll(chainId)),
    ).then(response => response.flat());
    this.items[chainId] = result;
    return result;
  }

  public get(chainId: ChainId, tokenId: TokenId, amount: string = '1') {
    const token = this.items[chainId]?.find(item => item.tokenId === tokenId);
    if (token !== undefined) {
      return BigNumber.from(token.price)
        .mul(parseUnits(amount, tokenUtils.getTokenById(tokenId).decimals))
        .div(token.precision)
        .toString();
    }
    return undefined;
  }
}

export const priceFeeds = new PriceFeeds([sovrynAmmOracle, sovrynLoanOracle]);
