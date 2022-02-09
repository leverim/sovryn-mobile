import { BigNumber } from 'ethers';
import { ChainId } from 'types/network';
import { parseUnits } from 'utils/helpers';

export enum AssetType {
  NATIVE,
  ERC20,
}

export class Asset {
  public readonly address: string;
  public readonly ONE: BigNumber;
  constructor(
    public readonly chainId: ChainId,
    public readonly id: string,
    public readonly symbol: string,
    public readonly name: string,
    _address: string,
    public readonly decimals: number = 18,
    public readonly icon: string,
    public readonly description: string,
    public readonly type: AssetType,
  ) {
    this.address = _address.toLowerCase();
    this.ONE = parseUnits('1', this.decimals);
  }
  public get native() {
    return this.type === AssetType.NATIVE;
  }
  public get erc20() {
    return this.type === AssetType.ERC20;
  }
}
