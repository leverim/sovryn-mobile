import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';
import { Asset } from './asset';

export enum LendingTokenFlags {
  REWARDS_ENABLED, // pool pays SOV rewards for lenders.
  DEPRECATED, // pool can't give new loans and exists only to collect repayments.
}

export class LendingToken {
  private _loanToken: Asset;
  private _supplyToken: Asset;
  constructor(
    public readonly chainId: ChainId,
    public readonly supplyTokenId: TokenId,
    public readonly loanTokenId: TokenId,
    public readonly collateralTokenIds: TokenId[],
    private readonly _flags: LendingTokenFlags | LendingTokenFlags[] = [],
  ) {
    this._supplyToken = findAsset(this.chainId, this.supplyTokenId);
    this._loanToken = findAsset(this.chainId, this.loanTokenId);
    if (!Array.isArray(this._flags)) {
      this._flags = [this._flags];
    }
  }
  public hasFlag(flag: LendingTokenFlags) {
    return this.flags.includes(flag);
  }
  public get flags() {
    return this._flags as LendingTokenFlags[];
  }
  public get supplyToken() {
    return this._supplyToken;
  }
  public get loanToken() {
    return this._loanToken;
  }
  public get loanTokenAddress() {
    return this.loanToken.address;
  }
  public get supplyTokenAddress() {
    return this.supplyToken.address;
  }
}
