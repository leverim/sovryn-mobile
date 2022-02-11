import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';

export type PriceOracleResult = {
  tokenId: TokenId;
  price: string;
  precision: string;
};

export interface IPriceOracle {
  getOne(chainId: ChainId, tokenId: TokenId): Promise<PriceOracleResult>;
  getAll(chainId: ChainId): Promise<PriceOracleResult[]>;
}
