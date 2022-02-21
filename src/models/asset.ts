import { getSwappableAsset, unwrapSwappableAsset } from 'config/swapables';
import { BigNumberish } from 'ethers';
import { ChainId } from 'types/network';
import { commifyDecimals, formatAndCommify, formatUnits, parseUnits } from 'utils/helpers';

export enum AssetType {
  NATIVE,
  ERC20,
}

export class Asset {
  public readonly address: string;
  public readonly ONE: string;
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
    this.ONE = parseUnits('1', this.decimals).toString();
  }
  public get native() {
    return this.type === AssetType.NATIVE;
  }
  public get erc20() {
    return this.type === AssetType.ERC20;
  }
  public getWrappedAsset() {
    return getSwappableAsset(this, this.chainId);
  }
  public getUnwrappedAsset() {
    return unwrapSwappableAsset(this, this.chainId);
  }
  public parseUnits(amount?: string) {
    return parseUnits(amount, this.decimals);
  }
  public formatUnits(amount?: BigNumberish) {
    return formatUnits(amount, this.decimals);
  }
  public commifyDecimals(amount?: string | number) {
    return commifyDecimals(amount, this.decimals);
  }
  public formatAndCommify(amount?: BigNumberish, decimals?: number) {
    return formatAndCommify(amount, this.decimals, decimals);
  }
}
