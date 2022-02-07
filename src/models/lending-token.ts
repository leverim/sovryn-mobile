import { ChainId } from 'types/network';
import { Token, TokenId } from 'types/token';
import { tokenUtils } from 'utils/token-utils';

export enum LendingTokenFlags {
  REWARDS_ENABLED, // pool pays SOV rewards for lenders.
  DEPRECATED, // pool can't give new loans and exists only to collect repayments.
}

export class LendingToken {
  private _loanToken: Token;
  private _supplyToken: Token;
  private _loanTokenAddress: string;
  private _supplyTokenAddress: string;
  constructor(
    public readonly chainId: ChainId,
    public readonly supplyTokenId: TokenId,
    public readonly loanTokenId: TokenId,
    public readonly collateralTokenIds: TokenId[],
    private readonly _flags: LendingTokenFlags | LendingTokenFlags[] = [],
  ) {
    this._supplyToken = tokenUtils.getTokenById(this.supplyTokenId);
    this._loanToken = tokenUtils.getTokenById(this.loanTokenId);

    this._loanTokenAddress = tokenUtils.getTokenAddressForChainId(
      this._loanToken,
      this.chainId,
    );
    this._supplyTokenAddress = tokenUtils.getTokenAddressForChainId(
      this._supplyToken,
      this.chainId,
    );

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
    return this._loanTokenAddress.toLowerCase();
  }
  public get supplyTokenAddress() {
    return this._supplyTokenAddress.toLowerCase();
  }
}
