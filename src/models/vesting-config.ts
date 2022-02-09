import { vestings } from 'config/vestings';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset } from 'utils/asset-utils';

export enum VestingContractType {
  SINGLE,
  LIST,
}

export type VestingContractMethod = 'getVesting' | 'getTeamVesting';

export class VestingConfig {
  constructor(
    public readonly chainId: ChainId,
    public readonly tokenId: TokenId,
    private readonly _registryAddress: string,
    public readonly type: VestingContractType = VestingContractType.LIST,
    public readonly vestingMethods: VestingContractMethod[] = ['getVesting'],
  ) {
    if (!this.vestingMethods.length && type === VestingContractType.SINGLE) {
      throw new Error(
        'SINGLE type vesting registry must have vesting methods specified.',
      );
    }
  }
  public get registryAddress() {
    return this._registryAddress.toLowerCase();
  }
  public get token() {
    return findAsset(this.chainId, this.tokenId);
  }

  public static get(tokenId: TokenId, chainId: ChainId) {
    return vestings.find(
      item => item.tokenId === tokenId && item.chainId === chainId,
    ) as VestingConfig;
  }
}
