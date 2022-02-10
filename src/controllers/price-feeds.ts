import { BigNumber } from 'ethers';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { parseUnits } from 'utils/helpers';
import {
  IPriceOracle,
  PriceOracleResult,
} from './price-oracles/price-oracle-interface';
import sovrynAmmOracle from './price-oracles/sovryn-amm-oracle';
import sovrynLoanOracle from './price-oracles/sovryn-loan-oracle';
import { cache } from 'utils/cache';
import { get, set } from 'lodash';

class PriceFeeds {
  private items: Partial<Record<ChainId, PriceOracleResult[]>> = cache.get(
    'prices',
    {} as any,
  );

  constructor(
    protected oracles: Partial<Record<ChainId, IPriceOracle[]>> = {},
  ) {}

  public async getAll(chainIds: ChainId[]) {
    const chains = chainIds
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
      this.items = set(
        this.items,
        [chainId],
        [...get(this.items, [chainId], []), ...value],
      );
    }
    await cache.set('prices', this.items);
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
