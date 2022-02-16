import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { Asset } from './asset';

export enum LendingTokenFlags {
  REWARDS_ENABLED, // pool pays SOV rewards for lenders.
  DEPRECATED, // pool can't give new loans and exists only to collect repayments.
}

export type AmmPoolVersion = 1 | 2;

export class AmmPool {
  public readonly converterAddress: string;
  public readonly supplyToken1: Asset;
  public readonly supplyToken2: Asset;
  public readonly poolToken1: Asset;
  public readonly poolToken2?: Asset;
  constructor(
    public readonly chainId: ChainId,
    public readonly version: AmmPoolVersion,
    public readonly supplyToken1Id: TokenId,
    public readonly supplyToken2Id: TokenId,
    _converterAddress: string,
    public readonly poolToken1Id: TokenId,
    public readonly poolToken2Id?: TokenId,
  ) {
    if (version === 2 && !poolToken2Id) {
      throw new Error(
        `Version 2 pools must have second pool token defined (${supplyToken1Id}/${supplyToken2Id}).`,
      );
    }
    this.converterAddress = _converterAddress.toLowerCase();
    this.supplyToken1 = findAsset(chainId, supplyToken1Id);
    this.supplyToken2 = findAsset(chainId, supplyToken2Id);
    this.poolToken1 = findAsset(chainId, poolToken1Id);
    if (poolToken2Id) {
      this.poolToken2 = findAsset(chainId, poolToken2Id);
    }
  }
}
