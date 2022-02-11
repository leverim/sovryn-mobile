import { networks } from 'config/networks';
import { ChainId } from 'types/network';

export const getNetworks = () => networks;

export function listNetworks(isTestnet: boolean) {
  return getNetworks().filter(item =>
    isTestnet
      ? item.isTestnet === true
      : item.isTestnet === false || !item.hasOwnProperty('isTestnet'),
  );
}

export const listMainnetNetworks = () =>
  getNetworks().filter(item => !item.isTestnet);

export const listTestnetNetworks = () =>
  getNetworks().filter(item => item.isTestnet);

export const getNetworkIds = (isTesnet: boolean) => {
  return listNetworks(isTesnet).map(item => item.chainId) as ChainId[];
};

export const getNetworkByChainId = (chainId: ChainId) =>
  getNetworks().find(item => item.chainId === chainId)!;
