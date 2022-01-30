import { networks } from 'config/networks';
import { BigNumberish, ethers } from 'ethers';
import { commify } from 'ethers/lib/utils';
import { ImageSourcePropType } from 'react-native';
import { ContractName } from 'types/contract';
import { ChainId } from 'types/network';
import { AccountType, BaseAccount } from './accounts';
import { contractUtils } from './contract';
import { Setting, settings } from './settings';

export const noop = () => {};

export const currentChainId = (): ChainId =>
  settings.get(Setting.DEFAULT_CHAIN_ID, 30);

export const getContractAddress = (
  contractName: ContractName,
  chainId: number = currentChainId(),
) => {
  const contract = contractUtils.getContractByName(contractName);
  if (!contractUtils.contractHasChainId(contract, chainId as ChainId)) {
    throw new Error(
      `Contract ${contractName} does not have ${chainId} chain defined.`,
    );
  }
  return contractUtils.getContractAddressForChainId(contract, chainId);
};

export const prettifyTx = (
  text: string,
  startLength: number = 6,
  endLength: number = 4,
) => {
  if (text?.length <= startLength + endLength + 5) {
    return text;
  }
  const start = text.substr(0, startLength);
  const end = text.substr(-endLength);
  return `${start} ··· ${end}`;
};

export const prepareImageSource = (
  uri?: string,
): ImageSourcePropType | null => {
  if (uri) {
    if (uri.startsWith('assets/')) {
      // todo load by path
      // return require(uri);
    }

    if (uri.startsWith('data:') || uri.startsWith('http')) {
      return {
        uri,
      };
    }
  }
  return null;
};

// export const floorDecimals = (value: number | string, decimals: number = 8) =>
//   Number(Math.floor(Number(`${value}e${decimals}`)) + 'e-' + decimals);

export const formatUnits = (
  value: BigNumberish = '0',
  unitName?: string | BigNumberish,
) => ethers.utils.formatUnits(value, unitName);

export const parseUnits = (
  value: string = '0',
  unitName?: string | BigNumberish,
) => ethers.utils.parseUnits(value, unitName);

export const floorDecimals = (value: number | string, decimals: number) => {
  try {
    const [integer, floater] = value.toString().split('.');
    return `${integer}.${floater.substring(0, decimals)}`;
  } catch (e) {
    console.error(
      `failed to floorDecimals value ${value} with ${decimals} decimals.`,
    );
    return '0';
  }
};

export const commifyDecimals = (
  value: string | number = '0',
  decimals: number = 8,
): string => commify(floorDecimals(value, decimals));

export const isReadOnlyWallet = (account: BaseAccount) =>
  account?.type === undefined || account.type === AccountType.PUBLIC_ADDRESS;

export const getTxInExplorer = (hash: string, chainId: ChainId) => {
  const explorerUrl = networks.find(item => item.chainId === chainId)?.explorer;
  return `${explorerUrl}/tx/${hash}`;
};

export const getAddressInExplorer = (address: string, chainId: ChainId) => {
  const explorerUrl = networks.find(item => item.chainId === chainId)?.explorer;
  return `${explorerUrl}/address/${address.toLowerCase()}`;
};
