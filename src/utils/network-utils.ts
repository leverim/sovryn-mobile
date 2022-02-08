import { networks } from 'config/networks';
import { ChainId } from 'types/network';

export function getNetworks() {
  return networks;
}

export function listNetworks(isTestnet: boolean) {
  return getNetworks().filter(item =>
    isTestnet
      ? item.isTestnet === true
      : item.isTestnet === false || !item.hasOwnProperty('isTestnet'),
  );
}

export function getNetworkIds(isTesnet: boolean) {
  return listNetworks(isTesnet).map(item => item.chainId) as ChainId[];
}
