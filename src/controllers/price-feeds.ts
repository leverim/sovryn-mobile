import { BigNumber } from 'ethers';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { parseUnits } from 'utils/helpers';
import { getNetworkIds } from 'utils/network-utils';
import {
  IPriceOracle,
  PriceOracleResult,
} from './price-oracles/price-oracle-interface';
import sovrynAmmOracle from './price-oracles/sovryn-amm-oracle';
import sovrynLoanOracle from './price-oracles/sovryn-loan-oracle';

class PriceFeeds {
  private items: Partial<Record<ChainId, PriceOracleResult[]>> = {};

  constructor(
    protected oracles: Partial<Record<ChainId, IPriceOracle[]>> = {},
  ) {}

  public async getAll(isTestnet: boolean) {
    const chains = getNetworkIds(isTestnet)
      .map(chainId =>
        (this.oracles[chainId] || []).map(item =>
          item.getAll(chainId).then(result => ({ [chainId]: result })),
        ),
      )
      .flat();

    const result = await Promise.all(chains);

    for (let item of result) {
      const [_key, value] = Object.entries(item)[0];
      const chainId = Number(_key) as ChainId;
      if (!this.items.hasOwnProperty(chainId)) {
        this.items[chainId] = [];
      }
      this.items[chainId] = [...this.items[chainId]!, ...value];
    }
    return this.items;
  }

  public get(chainId: ChainId, tokenId: TokenId, amount: string = '1') {
    const token = this.items[chainId]?.find(item => item.tokenId === tokenId);
    if (token !== undefined) {
      return BigNumber.from(token.price)
        .mul(parseUnits(amount, findAsset(chainId, tokenId).decimals))
        .div(token.precision)
        .toString();
    }
    return undefined;
  }
}

const rskOracles = [sovrynAmmOracle, sovrynLoanOracle];

export const priceFeeds = new PriceFeeds({
  30: rskOracles,
  31: rskOracles,
});
