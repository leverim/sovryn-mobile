import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { tokenUtils } from 'utils/token-utils';

export enum LendingTokenFlags {
  REWARDS_ENABLED, // pool pays SOV rewards for lenders.
  DEPRECATED, // pool can't give new loans and exists only to collect repayments.
}

export class LendingToken {
  constructor(
    public readonly chainId: ChainId,
    public readonly loanTokenId: TokenId,
    public readonly loanTokenAddress: string,
    public readonly collateralTokenIds: TokenId[],
    private readonly _flags: LendingTokenFlags | LendingTokenFlags[] = [],
    public readonly decimals: number = 18,
  ) {
    this.loanTokenAddress = loanTokenAddress.toLowerCase();
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
  public get token() {
    return tokenUtils.getTokenById(this.loanTokenId);
  }
  public get tokenAddress() {
    return tokenUtils.getTokenAddressForChainId(this.token, this.chainId);
  }
}
