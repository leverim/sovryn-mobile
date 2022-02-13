import { networks } from 'config/networks';
import { BigNumberish, ethers } from 'ethers';
import { commify } from 'ethers/lib/utils';
import { Dimensions } from 'react-native';
import { ContractName } from 'types/contract';
import { ChainId } from 'types/network';
import { AccountType, BaseAccount } from './accounts';
import { cache } from './cache';
import {
  STORAGE_CACHE_ENABLED_CHAINS,
  STORAGE_CACHE_SOVRYN_CHAIN,
  STORAGE_IS_TESTNET,
} from './constants';
import { contractUtils } from './contract';
import { listMainnetNetworks } from './network-utils';

export const noop = () => {};

/** @deprecated */
export const currentChainId = (): ChainId => (isMainnet() ? 30 : 31);

export const contractExists = (contractName: ContractName, chainId: number) => {
  const contract = contractUtils.getContractByName(contractName);
  return (
    contract && contractUtils.contractHasChainId(contract, chainId as ChainId)
  );
};

export const getContractAddress = (
  contractName: ContractName,
  chainId: number,
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
  return `${start} ... ${end}`;
};

export const formatUnits = (
  value: BigNumberish = '0',
  unitName?: string | BigNumberish,
) => ethers.utils.formatUnits(value || '0', unitName);

export const parseUnits = (
  value: string = '0',
  unitName?: string | BigNumberish,
) => ethers.utils.parseUnits(value || '0', unitName);

export const floorDecimals = (value: number | string, decimals: number) => {
  if (Number(value) === Infinity) {
    return '0';
  }
  try {
    const [integer = '0', floater = '0'] = (value || 0).toString().split('.');
    return `${integer}.${floater.substring(0, decimals)}`;
  } catch (e) {
    console.warn(
      `failed to floorDecimals value ${value} with ${decimals} decimals.`,
    );
    return '0';
  }
};

export const commifyDecimals = (
  value: string | number = '0',
  decimals: number = 8,
): string => commify(floorDecimals(value || '0', decimals));

export const formatAndCommify = (
  value?: BigNumberish,
  unitName?: string | BigNumberish,
  decimals?: number,
) => commifyDecimals(formatUnits(value, unitName), decimals);

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

// Scale sizes to other screens, scale it relativelly to iphone 11 (width 441 dp)
const { width } = Dimensions.get('window');
const scale = 414 / width;

export const px = (dp: number) => dp / scale;

export const calculateChange = (a: number, b: number) =>
  ((b - a) / Math.abs(a)) * 100;

export const numberIsEmpty = (value: string | number | undefined) =>
  !value || Number(value) === 0;

export const isTestnet = () => cache.get(STORAGE_IS_TESTNET) === '1';
export const isMainnet = () => !isTestnet();

export const enabledChainIds = () =>
  cache.get(
    STORAGE_CACHE_ENABLED_CHAINS,
    listMainnetNetworks().map(item => item.chainId),
  );

export const sovrynChainId = () => cache.get(STORAGE_CACHE_SOVRYN_CHAIN, 30);

export const setEnabledChainIds = (chainIds: ChainId[]) =>
  cache.set(STORAGE_CACHE_ENABLED_CHAINS, chainIds);

export const setSovrynChainId = (chainId: ChainId) =>
  cache.set(STORAGE_CACHE_SOVRYN_CHAIN, chainId);
