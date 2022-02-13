import { BigNumber } from 'ethers';
import { clone, unionBy } from 'lodash';
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
import { STORAGE_CACHE_PRICES } from 'utils/constants';

type Items = Partial<Record<ChainId, PriceOracleResult[]>>;

class PriceFeeds {
  private items: Items = cache.get(STORAGE_CACHE_PRICES, {} as any);

  constructor(
    protected oracles: Partial<Record<ChainId, IPriceOracle[]>> = {},
  ) {}

  public async getAll(chainIds: ChainId[]) {
    const items: Items = clone(this.items);
    for (const chainId of chainIds) {
      let chainData: PriceOracleResult[] = items[chainId] || [];
      for (const oracle of this.oracles[chainId] || []) {
        const result = await oracle.getAll(chainId);
        chainData = unionBy(result, chainData, 'tokenId');
      }
      items[chainId] = chainData;
    }
    this.items = items;
    await cache.set(STORAGE_CACHE_PRICES, this.items);
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
