import { ChainId } from 'types/network';
import { TokenId } from 'types/token';

export enum AssetType {
  NATIVE,
  ERC20,
}

export class Asset {
  public readonly address: string;
  constructor(
    public readonly chainId: ChainId,
    public readonly _id: string,
    public readonly symbol: string,
    public readonly name: string,
    _address: string,
    public readonly decimals: number = 18,
    public readonly icon: string,
    public readonly description: string,
    public readonly type: AssetType,
  ) {
    this.address = _address.toLowerCase();
  }
  public get id() {
    return this._id as TokenId;
  }
}
